const debounce = (func, delay = 300) => {
    let timeout;
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default debounce
