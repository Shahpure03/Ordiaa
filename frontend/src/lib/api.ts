const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getHeaders = () => {
    const token = localStorage.getItem("ordia_token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };
};

export const api = {
    // Habits
    getHabits: async () => {
        const res = await fetch(`${API_URL}/habits/`, { headers: getHeaders() });
        return res.json();
    },
    createHabit: async (name: string, description: string = "") => {
        const res = await fetch(`${API_URL}/habits/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ name, description }),
        });
        return res.json();
    },
    deleteHabit: async (id: number) => {
        const res = await fetch(`${API_URL}/habits/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        return res.json();
    },
    toggleHabit: async (habitId: number, date: string) => {
        const res = await fetch(`${API_URL}/habits/${habitId}/toggle?date=${date}`, {
            method: "POST",
            headers: getHeaders(),
        });
        return res.json();
    },
    getCompletions: async () => {
        const res = await fetch(`${API_URL}/habits/completions`, { headers: getHeaders() });
        return res.json();
    },

    // Todos
    getTodos: async () => {
        const res = await fetch(`${API_URL}/todos/`, { headers: getHeaders() });
        return res.json();
    },
    createTodo: async (title: string, is_completed: boolean = false) => {
        const res = await fetch(`${API_URL}/todos/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ title, is_completed }),
        });
        return res.json();
    },
    updateTodo: async (id: number, updates: any) => {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        return res.json();
    },
    deleteTodo: async (id: number) => {
        const res = await fetch(`${API_URL}/todos/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        return res.json();
    },

    // Logs
    getLogs: async () => {
        const res = await fetch(`${API_URL}/logs/`, { headers: getHeaders() });
        return res.json();
    },
    getLogByDate: async (date: string) => {
        const res = await fetch(`${API_URL}/logs/${date}`, { headers: getHeaders() });
        if (res.status === 404) return null;
        return res.json();
    },
    saveLog: async (date: string, content: string, mood: string = "") => {
        // Backend expects ISO datetime for 'date' field in DailyLogCreate
        const dateObj = new Date(date);
        const res = await fetch(`${API_URL}/logs/`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ date: dateObj.toISOString(), content, mood }),
        });
        return res.json();
    },
};
