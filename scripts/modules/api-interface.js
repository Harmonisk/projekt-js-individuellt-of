//API-INTERFACE MODULE

//get sumo wrestler by ring name
export async function getRikishiByShikona(shikona){
    try{
        let response=await fetch(`https://sumo-api.com/api/rikishis?shikonaEn=${shikona}&measurements=true&ranks=true`);
        if(!response.ok)
            throw new Error(`Failed to load sumo wrestler with ring name "${shikona}" from API: ${response.status}`);
        const data=await response.json();
        return data;
    }
    catch(error){throw new Error("Error: " , error);}
};

//get sumo wrestler by api-id
export async function getRikishiByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishi/${id}?intai=true`);
        if(!response.ok){throw new Error(`Failed to load sumo wrestler with id#${id} from api: ${response.status}`);}
        const rikishi=await response.json();
        return rikishi;
    }
    catch(error){throw new Error(`Error: ${error}`);}
};

//get additional sumo wrestler stats by api-id
export async function getStatsByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishi/${id}/stats`);
        if(!response.ok){throw new Error(`Failed to load additional stats for sumo wrestler with id#${id} from API: ${response.status}`);}
        const rikishi=await response.json();
        return rikishi;
    }
    catch(error){throw new Error(`Error: ${error}`);}
};

//get winning technique stats by technique name
export async function getKimarite(kimarite){
    try{
        const response=await fetch(`https://sumo-api.com/api/kimarite/${kimarite}`);
        if(!response.ok){throw new Error(`Failed to load finishing move statistics for finishing move named "${kimarite}" from API: ${response.status}`);}
        const data=await response.json();
    }
    catch(error){throw new Error(`Error: ${error}`);}
};

//get match results by sumo wrestler api-id
export async function getMatchesByID(id){
    try{
        const response=await fetch(`https://sumo-api.com/api/rikishi/${id}/matches`);
        if(!response.ok){
            throw new Error(`Failed to load match statistics for sumo wrestler id#${{id}} from API: ${response.status}`);
        }
        const data=await response.json();
        return data;
    }
    catch(error){throw new Error(`Error: ${error}`)}
}

//generate list of sumo wrestlers by division and tournament date
export async function getBanzuke(tournamentDate=202501, division="makuuchi"){
    try{
        const response=await fetch(`https://sumo-api.com/api/basho/${tournamentDate}/banzuke/${division}`);
        if(!response.ok){
            throw new Error(`Failed to load ranking list for "${division}" division and tournament date of "${tournamentDate}" from API: ${response.status}`);
        }
        const banzuke=await response.json();
        return banzuke;
    }
    catch(error){throw new Error(`Error: ${error}`);}
};