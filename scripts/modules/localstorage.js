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

//edit item in local storage by key
export function updateInLocalStorage(key, addedObjects=[], removedObjects=[]){
    console.log(`update: addedobjects.length:${addedObjects.length} removedobjects.length:${removedObjects.length}`);
    let collection=loadFromLocalStorage(key);
    if(collection==undefined){collection=[];}
    for(const remObj of removedObjects){
        console.log(remObj);
        collection.splice(collection.indexOf(remObj),1);
    }
    for(const addObj of addedObjects){collection.push(addObj);}
    saveToLocalStorage(key, collection);
}

//remove item fromlocal storage by key
export function removeFromLocalStorage(key){
    localStorage.removeItem(key);
};