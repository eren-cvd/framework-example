// Тоже observer, прямо как events Emitter, но работает со стором
// Функциональный подход из-за замыкания и приватных переменных в верхнем скоупе
export function createStore(rootReducer, initialState = {}) {
    let state = rootReducer({ ...initialState }, { type: '__INIT__' });
    let listeners = [];

    return {
        subscribe(callback) {
            listeners.push(callback);

            return {
                unsubscribe() {
                    listeners = listeners.filter(l => l !== callback);
                }
            };
        },

        dispatch(action) {
            state = rootReducer(state, action);

            listeners.forEach(listener => listener(state));
        },

        getState() {
            return JSON.parse(JSON.stringify(state));
        }
    };
}
