//IMPORTED EXTERNAL VARIABLES

//IMPORTED EXTERNAL FUNCTIONS
import { getRikishiByShikona, getMatchesByID, getRikishiByID, getStatsByID, getBanzuke, getKimarite } from "./modules/api-interface.js";
import { loadFromLocalStorage, saveToLocalStorage, updateInLocalStorage, removeFromLocalStorage} from "./modules/localstorage.js"

//GLOBAL NON DOM-OBJECT DECLARATIONS
const RING_NAMES=['Ura','Hoshoryu'];
const rikishisGlobal=[];
const PLACEHOLDER_ART="./assets/ai-generated-8722224_640.jpg";
const decks=[];
const DECK_SIZE=6;
let deckCount=loadFromLocalStorage('deckCount')!=null? loadFromLocalStorage('deckCount') : 0 ;

//GLOBAL DOM-OBJECT DECLARATIONS
const imageDisplay=document.getElementById('card-display');

//GLOBAL EVENT LISTENERS
document.getElementById('create-deck-button').addEventListener('click', (event)=> {
    createDeck();
    displayDecks();
});

//GLOBAL FUNCTIONS

//generate sumo wrestlers by tournament date and division, defaults to top division and latest tournament
async function generateRikishis(tournamentDate, division){
    const banzuke=await getBanzuke(tournamentDate, division);
    const {east:east, west:west}=banzuke;
    const rikishiIDs=[];
    for(const rikishi of east){rikishiIDs.push(rikishi.rikishiID);}
    for(const rikishi of west){rikishiIDs.push(rikishi.rikishiID);}

    for(const id of rikishiIDs){
        const rikishi=await getRikishiByID(id);

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
    rikishisGlobal.forEach((rikishi) => {saveToLocalStorage(`${rikishi.id}`, rikishi);})
    saveToLocalStorage("rikishiIDs",rikishiIDs);
    return rikishiIDs;
};

//find sumo wrestler by card
function findRikishiByCardHtmlContainer(container){
    return rikishisGlobal.find((rikishi)=>rikishi.card.htmlContainer===container);
}

//find deck by html container
function findDeckByContainer(container){
    return decks.find((deck)=>deck.htmlContainer===container);
}

//create a card from a sumo wrestler
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

    //add elements to html container
    card.htmlContainer.appendChild(card.portrait);
    card.htmlContainer.appendChild(card.ringName);
    card.htmlContainer.appendChild(card.rank);
    card.htmlContainer.appendChild(card.height);
    card.htmlContainer.appendChild(card.weight);

    //add event listener to card
    card.htmlContainer.addEventListener('click', (event)=>{
        let card=event.target.parentNode;
        if(event.target.classList.contains("card")){card=event.target;}
        let deck=getEditModeDeck();
        let breakLoop=false;
        console.log();
        if(deck!=undefined && deck!=null){
            deck.cards.forEach((cardContainer)=>{
                if(cardContainer.firstChild===card){
                    document.getElementById('card-display').appendChild(card);
                    updateInLocalStorage(deck.name.innerHTML,undefined,[findRikishiByCardHtmlContainer(card).id]);
                    breakLoop=true;
                }
            });
            console.log(breakLoop);
            deck.cards.forEach((cardContainer) => {
                if(breakLoop===false && cardContainer.firstChild===null && !card.parentNode.classList.contains("card-container")){
                    cardContainer.appendChild(card);
                    updateInLocalStorage(deck.name.innerHTML,[findRikishiByCardHtmlContainer(card).id]);
                    breakLoop=true;
                }
            });
        }
    });

    //add card to document
    rikishi.card=card;

};

//add card to deck
function addCardToDeck(card, deck){
    deck.cards.forEach((cardContainer) => {
        let breakLoop=false;
        if(breakLoop===false && cardContainer.firstChild===null && !card.parentNode.classList.contains("card-container")){
            cardContainer.appendChild(card);
            breakLoop=true;
        }
    });
};

//create deck
function createDeck(name=`Deck ${++deckCount}`, rikishiIds=[], stored=false){
    const deck={
        name: document.createElement('h3'),
        htmlContainer: document.createElement('div'),
        cards: [],
        cardsContainer: document.createElement('div'),
        editButton: document.createElement('button'),
        deleteButton: document.createElement('button'),
        editMode: false
    }

    //set content
    deck.name.innerHTML=name;
    deck.editButton.innerHTML=`Edit`;
    deck.deleteButton.innerHTML=`Delete`;

    //set classes
    deck.htmlContainer.classList.add(`deck-container`);
    deck.cardsContainer.classList.add(`cards-container`);
    deck.editButton.classList.add(`edit-button`);
    deck.deleteButton.classList.add(`delete-button`);

    //create card containers
    for (let count=0; count < DECK_SIZE; count++){
        const cardContainer=document.createElement('div');
        cardContainer.classList.add('card-container');
        deck.cards.push(cardContainer);
    }

    //set attributes
    deck.editButton.setAttribute('type', "button");
    deck.deleteButton.setAttribute('type', "button");
    deck.editButton.setAttribute('class', "edit-button");
    deck.deleteButton.setAttribute('type', "delete-button");

    //add event listeners
    deck.editButton.addEventListener('click', (event)=>{
        const parentDeck=decks.find((deck)=>deck.editButton===event.target);
        if(parentDeck.editMode){deactivateEditMode();}
        else{activateEditMode(parentDeck);}
    });

    deck.deleteButton.addEventListener('click', (event)=>{
        const parentDeck=findDeckByContainer(event.target.parentNode);
        parentDeck.cards.forEach((cardContainer)=>{
            const card=cardContainer.firstChild;
            if (card!=null){
                imageDisplay.appendChild(card);
            }
        });
        deactivateEditMode();
        parentDeck.htmlContainer.remove();
        decks.splice(decks.indexOf(parentDeck),1);
        updateInLocalStorage('deckNames',undefined,[parentDeck.name.innerHTML]);
        removeFromLocalStorage(parentDeck.name.innerHTML)
    });

    //add individual card containers to card container
    deck.cards.forEach((div)=>{deck.cardsContainer.appendChild(div);});

    //add to htmlcontainer
    deck.htmlContainer.appendChild(deck.name);
    deck.htmlContainer.appendChild(deck.cardsContainer);
    deck.htmlContainer.appendChild(deck.editButton);
    deck.htmlContainer.appendChild(deck.deleteButton);

    //add cards
    for(const id of rikishiIds){
        const card=rikishisGlobal.find((rikishi) => rikishi.id===id).card;
        addCardToDeck(card.htmlContainer, deck);
    }

    //add deck to global list of decks
    decks.push(deck);
    if(!stored){
        saveToLocalStorage(deck.name.innerHTML, rikishiIds);
        saveToLocalStorage('deckCount',deckCount);
        updateInLocalStorage('deckNames',[deck.name.innerHTML])
    }
};

function generateDecks(){
    const deckNames=loadFromLocalStorage('deckNames');
    if(deckNames!=null){
        for(const deckName of deckNames){
            createDeck(deckName,loadFromLocalStorage(deckName),true);
        }
    }
    displayDecks();
}

//activate edit mode for selected deck
function activateEditMode(deck){
    deactivateEditMode();
    deck.editMode=true;
    deck.editButton.innerHTML="Done";
    deck.htmlContainer.classList.add('editMode');
};

function deactivateEditMode(){
    decks.forEach((deck)=>{
        deck.editButton.innerHTML="Edit";
        deck.editMode=false;
        deck.htmlContainer.classList.remove('editMode');
    });
}

//find deck that is currently in edit mode
function getEditModeDeck(){
    return decks.find((deck)=>deck.editMode===true);
}

//generate cards for all loaded sumo wrestlers 
function generateCards(){
    rikishisGlobal.forEach((rikishi)=>{createCard(rikishi)});
};

//display decks in aside
function displayDecks(){
    decks.forEach((deck) => {document.getElementById('deck-display').appendChild(deck.htmlContainer);});
};

//display sumo wrestler cards in main section
function displayRikishis(){
    sortRikishi();
    rikishisGlobal.forEach((rikishi)=>{
        document.getElementById('card-display').appendChild(rikishi.card.htmlContainer);
    });
};

//sort sumo wrestlers by rank
function sortRikishi(){
    rikishisGlobal.sort((a, b)=>{
        let aRank=a.currentRank, bRank=b.currentRank;
        let aRankValue,bRankValue;
        aRankValue=findRankValue(aRank), bRankValue=findRankValue(bRank);
        let returnValue=-2;
        if(aRankValue<bRankValue){returnValue= -1;}
        else if(aRankValue>bRankValue){returnValue=1;}
        else{returnValue= 0;}
        return returnValue;
    });
};

//assign rank value to sumo wrestler for sorting purposes
function findRankValue(rank){
    let rankValue=0;
    if(rank.includes("West")){rankValue+=0.5;}
    
    switch(rank[0]){
        case "Y": rankValue+=0;  rankValue+=Number(rank[9]); break;
        case "O": rankValue+=10; rankValue+=Number(rank[6]); break;
        case "S": rankValue+=20; rankValue+=Number(rank[9]); break;
        case "K": rankValue+=30; rankValue+=Number(rank[9]); break;
        case "M": rankValue+=40;
        if(rank.length===17) rankValue+=Number(rank[11]);
        if(rank.length===18) rankValue+=Number(rank.substring(11, 13));
    }
    return rankValue;     
};

//test error messages from api
async function erroneousCalls(){
    try{
        //incorrect call to getBanzuke
        await getBanzuke("NotARealDate", "NotARealDivision");
    }
    catch(error){
        alert(`Critical error: ${error}`);
    }
    try{
        //incorrect call to getRikishiByID
        await getRikishiByID("NotARealID");
    }
    catch(error){
        alert(`Critical error: ${error}`);
    }
    try{
        //incorrect call to getMatchesByID
        await getMatchesByID("NotARealID");
    }
    catch(error){
        alert(`Critical error: ${error}`);
    }
    try{
        //incorrect call to getKimarite getKimarite
        await getKimarite("NotARealKimarite");
    }
    catch(error){
        alert(`Critical error: ${error}`);
    }
    try{
        //incorrect call to getStatsByID
        await getStatsByID("NotARealID");
    }
    catch(error){
        alert(`Critical error: ${error}`);
    }
    try{
        //incorrect call to getRikishiByShikona
        await getRikishiByShikona("NotARealShikona");
    }
    catch(error){
        alert(`Critical error: ${error}`);
    }
};

//initialize data
async function init(){
    try{
    let rikishisFromStorage=loadFromLocalStorage("rikishiIDs");
    if(rikishisFromStorage===undefined || rikishisFromStorage===null || rikishisFromStorage.length===0){
        alert(`Local data not found\nPlease wait for game to load!`);
        await generateRikishis();
    }
    else{
        rikishisFromStorage.forEach((id) => {
            rikishisGlobal.push(loadFromLocalStorage(`${id}`));
        });
    }
    generateCards();
    displayRikishis();
    generateDecks();
    }
    catch(error){
        alert(`Critical Error: ${error}\\n\\nPlease reload page or try again later!`);
    }
};

//run app
init();

