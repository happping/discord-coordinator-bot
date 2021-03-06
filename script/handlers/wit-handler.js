import 'dotenv/config' 
import  Wit  from 'node-wit'
import { allisIn, anyisIn } from '../extra/util.js';
//import { talkDB } from '../action/Chat.js';

export const client = new Wit.Wit({
  accessToken: process.env.WIT_TOKEN,
  logger: new Wit.log.Logger(Wit.log.DEBUG)
});

////////////
export const entitiesFilter = ( _entities ) =>{
    var entities = {}; 
    Object.keys(_entities).forEach( key => {
        if( _entities[key][0].role  == 'duration'){
            var duration = {}; 
            [ "second","minute", "hour","day","week","month", "year"].forEach(unit=>{
                if(unit in _entities[key][0]){
                    duration[unit] = _entities[key][0][unit]
                }
            })
            entities[_entities[key][0].role]=  duration ; //_entities[key][0].normalized.value
        }
        else if(_entities[key][0].role  == 'location' ){
            entities[_entities[key][0].role] =  _entities[key][0].resolved.values[0]
        }
        else{
                entities[_entities[key][0].role]=  _entities[key][0].value
        }
        
    }
        )
    return entities;
}
export const intentFilter = ( _intents ) =>{
    return _intents.filter(e => e.confidence > .75).map( e=>e.name);
}
export const traitFilter = ( _traits ) =>{
    var traits = {};
    Object.keys(_traits).forEach( k => {
        traits[k]= _traits[k].map(a =>a.value);
    })
    return traits; 
}
///////////

export const findIntention = async ( entities, intents, traits , talkDB  ) =>{

    return new Promise( (resolve,error)=>{

        for(var i = 0; i< talkDB.length;){

            var db = talkDB[i];
            var entitieIn = false ; var intentIn  = false ; var traitKeyIn  = false ; var traitValIn  = false ;
            
            // 1. 
            if( 'entities' in db && Object.keys(db.entities).length > 0 ) {
               entitieIn = allisIn(  db.entities,  Object.keys(entities)  )
            }
            else{
                entitieIn= true
            }
    
            // 2.  intent is must 
            if( 'intents' in db && db.intents.length > 0 ) {
                intentIn = allisIn(intents , db.intents)
            }
            else{
                intentIn = true
            }
    
            // 3. 
            if('traits' in db && Object.keys(db.traits).length > 0   )
            {
                traitKeyIn = anyisIn( Object.keys(traits) , Object.keys(db.traits)  ) ;
                if(traitKeyIn){       
                    Object.keys(traits).forEach( key =>{
                        var test = anyisIn(traits[key] , db.traits[key]) ;
                        traitValIn = test == false ? false : test ; 
                        }
                    )
                }
            }

            else{   traitKeyIn = true ; traitValIn = true ;}
        
            // fin 
            var result = !([entitieIn, intentIn, traitKeyIn, traitValIn ].includes(false));
            //console.log( entitieIn, intentIn, traitKeyIn, traitValIn )
            if ( result ){ 
                resolve(db);
                break;
            }
            else{  i += 1; }
            
            

        }

        

    })


    
    
}




