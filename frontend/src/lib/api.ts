const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getHeaders = () => {
    const token = localStorage.getItem("ordia_token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("ordia_token");
            window.location.reload();
            throw new Error("Unauthorized");
        }
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "API Error");
    }
    return res.json();
};

export const api = {
    // Habits
    getHabits: async () => {
        const res = await fetch(`${API_URL}/habits/`, { headers: getHeaders() });
        return handleResponse(res);
    },
    createHabit: async (name: string, description: string = "") => {
        const res = await fetch(`${API_URL}/habits/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ name, description }),
        });
        return handleResponse(res);
    },
    deleteHabit: async (id: number) => {
        const res = await fetch(`${API_URL}/habits/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        return handleResponse(res);
    },
    toggleHabit: async (habitId: number, date: string) => {
        const res = await fetch(`${API_URL}/habits/${habitId}/toggle?date=${date}`, {
            method: "POST",
            headers: getHeaders(),
        });
        return handleResponse(res);
    },
    getCompletions: async () => {
        const res = await fetch(`${API_URL}/habits/completions`, { headers: getHeaders() });
        return handleResponse(res);
    },

    // Todos
    getTodos: async () => {
        const res = await fetch(`${API_URL}/todos/`, { headers: getHeaders() });
        return handleResponse(res);
    },
    createTodo: async (title: string, is_completed: boolean = false, priority: string = "medium", status: string = "todo", due_date?: string) => {
        const res = await fetch(`${API_URL}/todos/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ title, is_completed, priority, status, due_date }),
        });
        return handleResponse(res);
    },
    updateTodo: async (id: number, updates: any) => {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        return handleResponse(res);
    },
    deleteTodo: async (id: number) => {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        return handleResponse(res);
    },

    // Logs
    getLogs: async () => {
        const res = await fetch(`${API_URL}/logs/`, { headers: getHeaders() });
        return handleResponse(res);
    },
    getLogByDate: async (date: string) => {
        const res = await fetch(`${API_URL}/logs/${date}`, { headers: getHeaders() });
        if (res.status === 404) return null;
        return handleResponse(res);
    },
    saveLog: async (date: string, content: string, mood: string = "") => {
        // Backend expects ISO datetime for 'date' field in DailyLogCreate
        const dateObj = new Date(date);
        const res = await fetch(`${API_URL}/logs/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ date: dateObj.toISOString(), content, mood }),
        });
        return handleResponse(res);
    },
};
