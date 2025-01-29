//IMPORTED EXTERNAL VARIABLES

//IMPORTED EXTERNAL FUNCTIONS
//import test from './external.js';

//GLOBAL NON DOM-OBJECT DECLARATIONS
const shikonas=['Ura','Hoshoryu'];
const rikishisGlobal=[];

//GLOBAL DOM-OBJECT DECLARATIONS
const imageDisplay=document.getElementById('image-display');

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
        const response=await fetch(`https://sumo-api.com/api/rikishis/${id}/`);
        if(!response.ok){throw new Error(`Error: ${response.status}`);}
        const rikishi=await response.json();
        console.log(rikishi);
        return rikishi;
    }
    catch(error){throw new Error(`Error: ${error}`);}
};

//get additional sumo wrestler stats by api-id
async function getStatsByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishis/${id}/stats`);
        if(!response.ok){throw new Error(`Error: ${response.status}`);}
        const rikishi=await response.json();
        console.log(rikishi);
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

//
async function generateRikishis(tournamentDate=202501){
    try{
        const response=await fetch(`https://sumo-api.com/api/basho/${tournamentDate}/banzuke/makuuchi`);
        if(!response.ok){
            throw new Error(`Error: ${response.status}`);
        }
        const banzuke=await response.json();
        console.log(banzuke);
        const {east:east, west:west}=banzuke;
        const rikishiIDs=[];
        for(const rikishi of east){rikishiIDs.push(rikishi.rikishiID);}
        for(const rikishi of west){rikishiIDs.push(rikishi.rikishiID);}
        console.log(rikishiIDs);
        /* rikishiIDs.forEach((id)=> {
            const rikishi=await getRikishiByID(id);
            rikishis.push()}); */
        for(id of rikishiIDs){
            const rikishi=await getRikishiByID(id);
            const rikishiParsed=await rikishi.json();
            const matches=await getMatchesByID(id);
            const matchesParsed=await matches.json();
            const stats=await getStatsByID(id);
            const statsParsed=await stats.json();
            rikishiParsed.matches=matchesParsed;
            rikishiParsed.stats=statsParsed;
            rikishisGlobal.push(rikishiParsed);
        }
    }
    catch(error){console.error(`Error: ${error}`);}
};

function saveToLocalStorage(key, object){
    const stringified=JSON.stringify(object);
    localStorage.setItem(key, stringified);
};

function loadFromLocalStorage(key){
    const obj=localStorage.getItem(key);
    const parsed=JSON.parse(obj);
    return parsed;
};

function removeFromLocalStorage(){};

function createCards(){

};

async function init(){
    //let result=await getRikishi('Ura');
    //let id=result.records[0].id;
    //console.log(result.records[0].id);
    //let matches=await getMatches(id);
    //console.log(matches);
    //getKimarite();
    generateRikishis();
};

//init();

//getMatches();

//console.log(test());