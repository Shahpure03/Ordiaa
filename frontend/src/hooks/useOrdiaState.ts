import { useState, useEffect, useCallback } from "react";
import type { OrdiaaState, Habit, TodoItem, TodoPriority, TodoStatus } from "@/lib/types";
import { loadState, saveState, formatDate } from "@/lib/storage";
import { api } from "@/lib/api";

export function useOrdiaaState() {
    // Initialize state from localStorage initially
    const [state, setState] = useState<OrdiaaState>(loadState);
    const token = localStorage.getItem("ordia_token");

    // Fetch from backend when token is present
    useEffect(() => {
        if (!token) return;

        const syncWithBackend = async () => {
            try {
                const [habitsData, completionsData, todosData, logsData] = await Promise.all([
                    api.getHabits(),
                    api.getCompletions(),
                    api.getTodos(),
                    api.getLogs(),
                ]);

                // Transform API data to local state format
                const habits = habitsData.map((h: any) => ({
                    id: String(h.id),
                    name: h.name,
                    emoji: "✨", // Default emoji as backend doesn't store it yet
                }));

                const completions: Record<string, boolean> = {};
                completionsData.forEach((c: any) => {
                    const dateStr = c.completed_at.split('T')[0];
                    completions[`${c.habit_id}-${dateStr}`] = true;
                });

                const todos: Record<string, TodoItem[]> = {};
                todosData.forEach((t: any) => {
                    const dateStr = t.created_at.split('T')[0];
                    if (!todos[dateStr]) todos[dateStr] = [];
                    todos[dateStr].push({
                        id: String(t.id),
                        text: t.title,
                        completed: t.is_completed,
                        status: t.is_completed ? "done" : "todo",
                        priority: "medium",
                        createdAt: dateStr,
                    });
                });

                const logs: Record<string, string> = {};
                logsData.forEach((l: any) => {
                    const dateStr = l.date.split('T')[0];
                    logs[dateStr] = l.content;
                });

                setState({ habits, completions, todos, logs });
            } catch (err) {
                console.error("Failed to sync with backend:", err);
            }
        };

        syncWithBackend();
    }, [token]);

    // Save to localStorage whenever state changes (fallback persistence)
    useEffect(() => {
        saveState(state);
    }, [state]);

    // Toggle a habit's completion
    const toggleHabit = useCallback(async (habitId: string, date: Date) => {
        const dateStr = formatDate(date);
        const key = `${habitId}-${dateStr}`;

        // Optimistic update
        setState((prev) => ({
            ...prev,
            completions: {
                ...prev.completions,
                [key]: !prev.completions[key],
            },
        }));

        // Backend update
        if (token) {
            try {
                await api.toggleHabit(parseInt(habitId), dateStr);
            } catch (err) {
                console.error("Failed to toggle habit on backend", err);
            }
        }
    }, [token]);

    const updateLog = useCallback(async (date: Date, text: string) => {
        const dateStr = formatDate(date);
        setState((prev) => ({
            ...prev,
            logs: { ...prev.logs, [dateStr]: text },
        }));

        if (token) {
            try {
                await api.saveLog(dateStr, text);
            } catch (err) {
                console.error("Failed to save log to backend", err);
            }
        }
    }, [token]);

    const getLog = useCallback(
        (date: Date): string => {
            return state.logs[formatDate(date)] || "";
        },
        [state.logs]
    );

    const getTodos = useCallback(
        (date: Date): TodoItem[] => {
            return state.todos[formatDate(date)] || [];
        },
        [state.todos]
    );

    const addTodo = useCallback(async (date: Date, text: string, priority: TodoPriority = "medium", status: TodoStatus = "todo") => {
        const dateStr = formatDate(date);

        if (token) {
            try {
                const newTodoData = await api.createTodo(text, status === "done");
                const newTodo: TodoItem = {
                    id: String(newTodoData.id),
                    text: newTodoData.title,
                    completed: newTodoData.is_completed,
                    status: newTodoData.is_completed ? "done" : "todo",
                    priority,
                    createdAt: dateStr,
                };

                setState((prev) => ({
                    ...prev,
                    todos: {
                        ...prev.todos,
                        [dateStr]: [...(prev.todos[dateStr] || []), newTodo],
                    },
                }));
            } catch (err) {
                console.error("Failed to add todo to backend", err);
            }
        } else {
            // Local-only fallback
            const newTodo: TodoItem = {
                id: Date.now().toString(),
                text,
                completed: status === "done",
                status,
                priority,
                createdAt: dateStr,
            };
            setState((prev) => ({
                ...prev,
                todos: {
                    ...prev.todos,
                    [dateStr]: [...(prev.todos[dateStr] || []), newTodo],
                },
            }));
        }
    }, [token]);

    const toggleTodo = useCallback(async (date: Date, todoId: string) => {
        const dateStr = formatDate(date);
        const todo = (state.todos[dateStr] || []).find(t => t.id === todoId);
        if (!todo) return;

        const newCompleted = !todo.completed;

        // Optimistic update
        setState((prev) => ({
            ...prev,
            todos: {
                ...prev.todos,
                [dateStr]: (prev.todos[dateStr] || []).map((t) =>
                    t.id === todoId ? { ...t, completed: newCompleted, status: newCompleted ? "done" : "todo" } : t
                ),
            },
        }));

        if (token) {
            try {
                await api.updateTodo(parseInt(todoId), { is_completed: newCompleted });
            } catch (err) {
                console.error("Failed to update todo on backend", err);
            }
        }
    }, [state.todos, token]);

    const updateTodo = useCallback(async (date: Date, todoId: string, updates: Partial<TodoItem>) => {
        const dateStr = formatDate(date);

        setState((prev) => ({
            ...prev,
            todos: {
                ...prev.todos,
                [dateStr]: (prev.todos[dateStr] || []).map((t) =>
                    t.id === todoId ? { ...t, ...updates } : t
                ),
            },
        }));

        if (token) {
            try {
                const apiUpdates: any = {};
                if (updates.text) apiUpdates.title = updates.text;
                if (updates.completed !== undefined) apiUpdates.is_completed = updates.completed;
                if (updates.status === "done") apiUpdates.is_completed = true;

                await api.updateTodo(parseInt(todoId), apiUpdates);
            } catch (err) {
                console.error("Failed to update todo on backend", err);
            }
        }
    }, [token]);

    const deleteTodo = useCallback(async (date: Date, todoId: string) => {
        const dateStr = formatDate(date);

        setState((prev) => ({
            ...prev,
            todos: {
                ...prev.todos,
                [dateStr]: (prev.todos[dateStr] || []).filter((t) => t.id !== todoId),
            },
        }));

        if (token) {
            try {
                await api.deleteTodo(parseInt(todoId));
            } catch (err) {
                console.error("Failed to delete todo on backend", err);
            }
        }
    }, [token]);

    const addHabit = useCallback(async (name: string, emoji: string) => {
        if (token) {
            try {
                const habitData = await api.createHabit(name);
                const newHabit: Habit = {
                    id: String(habitData.id),
                    name: habitData.name,
                    emoji,
                };
                setState((prev) => ({
                    ...prev,
                    habits: [...prev.habits, newHabit],
                }));
            } catch (err) {
                console.error("Failed to add habit to backend", err);
            }
        } else {
            const newHabit: Habit = { id: Date.now().toString(), name, emoji };
            setState((prev) => ({
                ...prev,
                habits: [...prev.habits, newHabit],
            }));
        }
    }, [token]);

    const deleteHabit = useCallback(async (habitId: string) => {
        setState((prev) => ({
            ...prev,
            habits: prev.habits.filter((h) => h.id !== habitId),
        }));

        if (token) {
            try {
                await api.deleteHabit(parseInt(habitId));
            } catch (err) {
                console.error("Failed to delete habit on backend", err);
            }
        }
    }, [token]);

    const getCompletionRate = useCallback(
        (date: Date): number => {
            const dateStr = formatDate(date);
            const total = state.habits.length;
            if (total === 0) return 0;
            const completed = state.habits.filter(
                (h) => state.completions[`${h.id}-${dateStr}`]
            ).length;
            return Math.round((completed / total) * 100);
        },
        [state.habits, state.completions]
    );

    const getCompletionHistory = useCallback(
        (days: number): { date: string; rate: number }[] => {
            const history: { date: string; rate: number }[] = [];
            const today = new Date();
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                history.push({
                    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    rate: getCompletionRate(date),
                });
            }
            return history;
        },
        [getCompletionRate]
    );

    return {
        habits: state.habits,
        completions: state.completions,
        logs: state.logs,
        todos: state.todos,
        toggleHabit,
        isHabitCompleted: (habitId: string, date: Date) => {
            const key = `${habitId}-${formatDate(date)}`;
            return state.completions[key] ?? false;
        },
        updateLog,
        getLog,
        getTodos,
        addTodo,
        toggleTodo,
        updateTodo,
        deleteTodo,
        getCompletionRate,
        getCompletionHistory,
        addHabit,
        deleteHabit,
    };
}

// Export the return type so components can use it
export type OrdiaaStateHook = ReturnType<typeof useOrdiaaState>;
