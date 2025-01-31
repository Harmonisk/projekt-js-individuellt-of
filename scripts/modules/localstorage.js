//LOCAL STORAGE MODULE

//save item to storage by key
export function saveToLocalStorage(key, object){
    const stringified=JSON.stringify(object);
    localStorage.setItem(key, stringified);
};

//load item from storage by key
export function loadFromLocalStorage(key){
    const obj=localStorage.getItem(key);
    const parsed=JSON.parse(obj);
    return parsed;
};

//remove function by key
export function removeFromLocalStorage(key){};