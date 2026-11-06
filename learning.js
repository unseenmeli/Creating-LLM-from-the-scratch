function flatten(arr, n) {
    let res1 = arr;
    for (let count = 0; count < n; count++) {
        const res = [];
        for (const items of res1) {
            if (Array.isArray(items)) {
                for (const components of items) {
                    res.push(components)
                }
            } else {
                    res.push(items);
            }
        }
        res1 = res;
    }
    return res1;
};

console.log(flatten([1, 2, [3, [4, [5]]]], 2))