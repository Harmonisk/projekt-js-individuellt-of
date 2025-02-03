//IMPORTED EXTERNAL VARIABLES

//IMPORTED EXTERNAL FUNCTIONS
import { getRikishiByShikona, getMatchesByID, getRikishiByID, getStatsByID, getBanzuke } from "./modules/api-interface.js";
import { loadFromLocalStorage, saveToLocalStorage, updateInLocalStorage, removeFromLocalStorage} from "./modules/localstorage.js"

//GLOBAL NON DOM-OBJECT DECLARATIONS
const shikonas=['Ura','Hoshoryu'];
const rikishisGlobal=[];
const PLACEHOLDER_ART="./assets/ai-generated-8722224_640.jpg";
const decks=[];
const deckSize=6;
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
};

//find sumo wrestler by card
function findRikishiByCard(card){
    return rikishisGlobal.find((rikishi)=>rikishi.card===card);
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
    //card.portrait.setAttribute('height','640');
    //card.portrait.setAttribute('weight','426');

    //add elements to html container
    card.htmlContainer.appendChild(card.portrait);
    card.htmlContainer.appendChild(card.ringName);
    card.htmlContainer.appendChild(card.rank);
    card.htmlContainer.appendChild(card.height);
    card.htmlContainer.appendChild(card.weight);

    //add event listener to card
    card.htmlContainer.addEventListener('click', (event)=>{
        console.log(`This card clicked: ${event.target.parentNode.getElementsByTagName('h3')[0].innerHTML}`);
        let card=event.target.parentNode;
        if(event.target.classList.contains("card")){card=event.target;}
        let deck=getEditModeDeck();
        let breakLoop=false;
        console.log();
        if(deck!=undefined && deck!=null){
            //console.log(`not undefined or null, deck: ${JSON.stringify(deck)}`);
            deck.cards.forEach((cardContainer)=>{
                if(cardContainer.firstChild===card){
                    document.getElementById('card-display').appendChild(card);
                    breakLoop=true;
                }
            });
            console.log(breakLoop);
            deck.cards.forEach((cardContainer) => {
                if(breakLoop===false && cardContainer.firstChild===null && !card.parentNode.classList.contains("card-container")){
                    cardContainer.appendChild(card);
                    breakLoop=true;
                }
            });
        }
    });

    //add card to document
    rikishi.card=card;

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
    //deck.name.innerHTML=`Deck ${decks.length+1}`;
    deck.name.innerHTML=name;
    deck.editButton.innerHTML=`Edit`;
    deck.deleteButton.innerHTML=`Delete`;

    //set classes
    deck.htmlContainer.classList.add(`deck-container`);
    deck.cardsContainer.classList.add(`cards-container`);
    deck.editButton.classList.add(`edit-button`);
    deck.deleteButton.classList.add(`delete-button`);

    //create card containers
    for (let count=0; count < deckSize; count++){
        const cardContainer=document.createElement('div');
        cardContainer.classList.add('card-container');
        deck.cards.push(cardContainer);
        //div.appendChild(rikishisGlobal[count++].card.htmlContainer);
    }
    
    console.log(deck.cards.length);

    //add cards
    //deck.cards[0].appendChild(rikishisGlobal[5].card.htmlContainer);

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
        //console.log(parentDeck.name.innerHTML);
        parentDeck.htmlContainer.remove();
        //console.log(decks.findIndex(parentDeck));
        decks.splice(decks.indexOf(parentDeck),1);
        updateInLocalStorage('deckNames',undefined,[parentDeck.name.innerHTML]);
        /* let count=0;
        decks.forEach((deck)=>{deck.name.innerHTML=`Deck ${++count}`}); */
    });

    //add individual card containers to card container
    deck.cards.forEach((div)=>{deck.cardsContainer.appendChild(div);});

    //add to htmlcontainer
    deck.htmlContainer.appendChild(deck.name);
    deck.htmlContainer.appendChild(deck.cardsContainer);
    deck.htmlContainer.appendChild(deck.editButton);
    deck.htmlContainer.appendChild(deck.deleteButton);

    //console.log(`${JSON.stringify(deck.htmlContainer)}`);

    decks.push(deck);
    if(!stored){
        //console.log(deck.name.innerHTML);
        saveToLocalStorage(deck.name, rikishiIds);
        saveToLocalStorage('deckCount',deckCount);
        //let deckNames=[deck.name.innerHTML];
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
    //console.log(deck);
    deck.editMode=true;
    deck.editButton.innerHTML="Done";
    deck.htmlContainer.setAttribute('id', 'editMode');
};

function deactivateEditMode(){
    decks.forEach((deck)=>{
        deck.editButton.innerHTML="Edit";
        deck.editMode=false;
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
        //console.log(`A rank: ${aRank}, rank value: ${aRankValue=findRankValue(aRank)},\nB rank: ${bRank}, rank value: ${bRankValue=findRankValue(bRank)}`);
        let returnValue=-2;
        if(aRankValue<bRankValue){returnValue= -1;}
        else if(aRankValue>bRankValue){returnValue=1;}
        else{returnValue= 0;}
        //console.log(`Sorting algorithm return value: ${returnValue}`);
        return returnValue;
    });
};

//assign rank value to sumo wrestler for sorting purposes
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
    //console.log(rikishisGlobal);
    displayRikishis();
    generateDecks();
    //createDeck();
    //displayDecks();
};

//run app
init();

