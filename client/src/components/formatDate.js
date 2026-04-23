function formatDate(date) {
    if (!(date instanceof Date)) {
        throw new Error("Invalid date. Please provide a valid Date object.");
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export default formatDate