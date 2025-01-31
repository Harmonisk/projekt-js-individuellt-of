//API-INTERFACE MODULE

//get sumo wrestler by ring name
export async function getRikishiByShikona(shikona){
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
export async function getRikishiByID(id){
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
export async function getStatsByID(id){
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
export async function getKimarite(kimarite){
    try{
        const response=await fetch(`https://sumo-api.com/api/kimarite/${kimarite}`);
        if(!response.ok){throw new Error('${response.status}');}
        const data=await response.json();
        //console.log(data);
    }
    catch(error){console.error(`Error: ${error}`);}
};

//get match results by sumo wrestler api-id
export async function getMatchesByID(id){
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

//generate list of sumo wrestlers by division and tournament date
export async function getBanzuke(tournamentDate=202501, division="makuuchi"){
    try{
        const response=await fetch(`https://sumo-api.com/api/basho/${tournamentDate}/banzuke/${division}`);
        if(!response.ok){
            throw new Error(`Error: ${response.status}`);
        }
        const banzuke=await response.json();
        return banzuke;
    }
    catch(error){console.error(`Error: ${error}`);}
};