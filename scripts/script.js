//IMPORTED EXTERNAL VARIABLES

//IMPORTED EXTERNAL FUNCTIONS

//GLOBAL NON DOM-OBJECT DECLARATIONS
const shikonas=['Ura','Hoshoryu'];
const rikishisGlobal=[];
const PLACEHOLDER_ART="./assets/ai-generated-8722224_640.jpg";
const decks=[];

//GLOBAL DOM-OBJECT DECLARATIONS
const imageDisplay=document.getElementById('card-display');

//GLOBAL EVENT LISTENERS

//GLOBAL FUNCTIONS

//get sumo wrestler by ring name
async function getRikishiByShikona(shikona){
    try{
        let response=await fetch(`https://sumo-api.com/api/rikishis?shikonaEn=${shikona}&measurements=true&ranks=true`);
        if(!response.ok)
            throw new Error(`${response.status}`);
        //console.log(response);
        const data=await response.json();
        //console.log(data);
        return data;
    }
    catch(error){
        console.error("Error: " , error)
    }
};

//get sumo wrestler by api-id
async function getRikishiByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishi/${id}?intai=true`);
        if(!response.ok){throw new Error(`Error: ${response.status}`);}
        //console.log("getRikishiByID() pre response.json()");
        const rikishi=await response.json();
        //console.log("getRikishiByID() post response.json()", rikishi);
        return rikishi;
    }
    catch(error){throw new Error(`Error: ${error}`);}
};

//get additional sumo wrestler stats by api-id
async function getStatsByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishi/${id}/stats`);
        if(!response.ok){throw new Error(`Error: ${response.status}`);}
        const rikishi=await response.json();
        //console.log(rikishi);
        return rikishi;
    }
    catch(error){throw new Error(`Error: ${error}`);}
};

//get winning technique stats by technique name
async function getKimarite(kimarite){
    try{
        const response=await fetch(`https://sumo-api.com/api/kimarite/${kimarite}`);
        if(!response.ok){throw new Error('${response.status}');}
        const data=await response.json();
        //console.log(data);
    }
    catch(error){console.error(`Error: ${error}`);}
};

//get match results by sumo wrestler api-id
async function getMatchesByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishi/${id}/matches`);
        if(!response.ok){
            throw new Error(`Error: ${response.status}`);
        }
        const data=await response.json();
        return data;
    }
    catch(error){console.error(`Error: ${error}`)}
}

//generate sumo wrestlers by tournament date and division, defaults to top division and latest tournament
async function generateRikishis(tournamentDate=202501, division="makuuchi"){
    try{
        const response=await fetch(`https://sumo-api.com/api/basho/${tournamentDate}/banzuke/${division}`);
        if(!response.ok){
            throw new Error(`Error: ${response.status}`);
        }
        const banzuke=await response.json();
        //console.log(banzuke);
        const {east:east, west:west}=banzuke;
        const rikishiIDs=[];
        for(const rikishi of east){rikishiIDs.push(rikishi.rikishiID);}
        for(const rikishi of west){rikishiIDs.push(rikishi.rikishiID);}
        //console.log(rikishiIDs);
        for(const id of rikishiIDs){
            const rikishi=await getRikishiByID(id);
            console.log(`Rikishi fetched: ${rikishi.shikonaEn}`);

            //add extra data
            /*
            //const matches=await getMatchesByID(id);
            //const stats=await getStatsByID(id);
            //rikishi.matches=matches;
            //rikishi.stats=stats;
            */

            rikishisGlobal.push(rikishi);
        }
        console.log("generation complete");
        sortRikishi();
        //console.log(JSON.stringify(rikishisGlobal));
        rikishisGlobal.forEach((rikishi) => {saveToLocalStorage(`${rikishi.id}`, rikishi);})
        saveToLocalStorage("rikishiIDs",rikishiIDs);
        return rikishiIDs;
    }
    catch(error){console.error(`Error: ${error}`);}
};

//save item to storage by key
function saveToLocalStorage(key, object){
    const stringified=JSON.stringify(object);
    localStorage.setItem(key, stringified);
};

//load item from storage by key
function loadFromLocalStorage(key){
    const obj=localStorage.getItem(key);
    const parsed=JSON.parse(obj);
    return parsed;
};

//remove function by key
function removeFromLocalStorage(key){};

function createCard(rikishi){
    //create card object with DOM-elements
    const card={
        rikishi: rikishi,
        htmlContainer: document.createElement('div'),
        portrait: document.createElement('img'),
        ringName: document.createElement('h3'),
        rank: document.createElement('h4'),
        height: document.createElement('p'),
        weight: document.createElement('p')
    }
    //set content
    card.portrait.setAttribute('src', PLACEHOLDER_ART);
    card.ringName.innerHTML=rikishi.shikonaEn;
    card.rank.innerHTML=rikishi.currentRank;
    card.height.innerHTML=`${rikishi.height} cm`;
    card.weight.innerHTML=`${rikishi.weight} kg`;

    //set additional attributes
    card.htmlContainer.setAttribute('id', `rikishi#${rikishi.id}`);
    card.htmlContainer.classList.add('card');
    card.portrait.setAttribute('alt', `Portrait of professional sumo wrestler ${rikishi.shikonaEn}`);
    //card.portrait.setAttribute('height','640');
    //card.portrait.setAttribute('weight','426');

    //add elements to html container
    card.htmlContainer.appendChild(card.portrait);
    card.htmlContainer.appendChild(card.ringName);
    card.htmlContainer.appendChild(card.rank);
    card.htmlContainer.appendChild(card.height);
    card.htmlContainer.appendChild(card.weight);

    //add card to document
    rikishi.card=card;

};

function createDeck(){
    const deck={
        name: document.createElement('h3'),
        htmlContainer: document.createElement('div'),
        cards: [
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div'),
        ],
        cardsContainer: document.createElement('div'),
        editButton: document.createElement('button'),
        deleteButton: document.createElement('button')
    }
    //set content
    deck.name.innerHTML=`Deck 1`;
    deck.editButton.innerHTML=`Edit`;
    deck.deleteButton.innerHTML=`Delete`;

    //set classes
    deck.htmlContainer.classList.add(`deck-container`);
    deck.cardsContainer.classList.add(`cards-container`);
    deck.editButton.classList.add(`edit-button`);
    deck.deleteButton.classList.add(`delete-button`);

    //add cards 
    let count=0;
    deck.cards.forEach((div)=>
        {div.classList.add('card-container');
        div.appendChild(rikishisGlobal[count++].card.htmlContainer);
        }
    );

    //test
    deck.cards[5].firstChild.remove();

    //set attributes
    deck.editButton.setAttribute('type', "button");
    deck.deleteButton.setAttribute('type', "button");

    //add individual card containers to card container
    deck.cards.forEach((div)=>{deck.cardsContainer.appendChild(div);});

    //add to htmlcontainer
    deck.htmlContainer.appendChild(deck.name);
    deck.htmlContainer.appendChild(deck.cardsContainer);
    deck.htmlContainer.appendChild(deck.editButton);
    deck.htmlContainer.appendChild(deck.deleteButton);

    decks.push(deck);
};

//generate cards for all loaded sumo wrestlers 
function generateCards(){
    rikishisGlobal.forEach((rikishi)=>{createCard(rikishi)});
};

function displayDecks(){
    decks.forEach((deck) => {document.getElementById('deck-display').appendChild(deck.htmlContainer);});
};

function displayRikishis(){
    sortRikishi();
    rikishisGlobal.forEach((rikishi)=>{
        document.getElementById('card-display').appendChild(rikishi.card.htmlContainer);
    });
};

function sortRikishi(){
    rikishisGlobal.sort((a, b)=>{
        let aRank=a.currentRank, bRank=b.currentRank;
        let aRankValue,bRankValue;
        aRankValue=findRankValue(aRank), bRankValue=findRankValue(bRank);
        //console.log(`A rank: ${aRank}, rank value: ${aRankValue=findRankValue(aRank)},\nB rank: ${bRank}, rank value: ${bRankValue=findRankValue(bRank)}`);
        let returnValue=-2;
        if(aRankValue<bRankValue){returnValue= -1;}
        else if(aRankValue>bRankValue){returnValue=1;}
        else{returnValue= 0;}
        //console.log(`Sorting algorithm return value: ${returnValue}`);
        return returnValue;
    });
};

function findRankValue(rank){
    let rankValue=0;
    if(rank.includes("West")){rankValue+=0.5;}
    if(rank.includes("Yokozuna")){
        rankValue+=Number(rank[9]);
    }
    if(rank.includes("Ozeki")){
        rankValue+=10;
        rankValue+=Number();
    }
    if(rank.includes("Sekiwake")){
        rankValue+=20;
        rankValue+=Number(rank[9]);
    }
    if(rank.includes("Komusubi")){
        rankValue+=30;
        rankValue+=Number(rank[9]);
    }
    if(rank.includes("Maegashira")){
        rankValue+=40;
        if(rank.length===17){
            rankValue+=Number(rank[11]);
        }
        if(rank.length===18){
            rankValue+=Number(rank.substring(11, 13));
        }
    }
    //console.log(`Rank: ${rank}, Rank value: ${rankValue}`);
    return rankValue;
};

//initialize data
async function init(){
    let rikishisFromStorage=loadFromLocalStorage("rikishiIDs");
    if(rikishisFromStorage===undefined || rikishisFromStorage===null || rikishisFromStorage.length===0){await generateRikishis();}
    else{
        rikishisFromStorage.forEach((id) => {
            rikishisGlobal.push(loadFromLocalStorage(`${id}`));
        });
    }
    generateCards();
    console.log(rikishisGlobal);
    displayRikishis();
    createDeck();
    displayDecks();
};

init();

