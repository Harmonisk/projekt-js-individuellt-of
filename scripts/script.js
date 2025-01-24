//GLOBAL NON DOM-OBJECT DECLARATIONS
const imageDisplay=document.getElementById('image-display');

//GLOBAL DOM-OBJECT DECLARATIONS

//GLOBAL EVENT LISTENERS

//GLOBAL FUNCTIONS

async function getMatches(){
    try{
        let response=await fetch('https://sumo-api.com/api/rikishis?shikonaEn=Terunofuji');

        if(!response.ok)
            throw new Error(`${response.status}`);
        console.log(response);
        const data=await response.json();
        console.log(data.results);
    }
    catch(error){
        console.error("Error: " , error)
    }
};

getMatches();