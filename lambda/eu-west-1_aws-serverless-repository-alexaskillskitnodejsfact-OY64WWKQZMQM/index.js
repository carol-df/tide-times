/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
var http = require('http');
var https = require('https');

function httpGet(query) {
  return new Promise(((resolve, reject) => {
    var options = {
        host: 'admiraltyapi.azure-api.net',
        port: 443,
        path: '/uktidalapi/api/V1/Stations/'+ encodeURIComponent(query)+'/TidalEvents?duration=1',
        method: 'GET',
        headers: {"Content-Type" : "application/json","Ocp-Apim-Subscription-Key":"135fc01a02f1423084d2b0ee4ba0cbc2"}
    };
    
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}

function tideFormat(response) {
  var string = '';
  console.log(response);
  for (var i=0, len = response.length; i < len; i++){
    if(response[i].DateTime != null)
    {
      var now = new Date(response[i].DateTime);
      string = string + response[i].EventType + ' ' + now.toLocaleTimeString().replace(/(:\d{2}| [AP]M)$/, "");
      response[i].Time = now.toLocaleTimeString().replace(/(:\d{2}| [AP]M)$/, "");
      if(i==len-1){
        string = string + '. ';
      }
      else {
        string = string + ', ';
      }
    }
  }
  console.log(string);
  return string;
}

const GetTidalDataHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'GetTidalDataIntent';
  },
  async handle(handlerInput) {
    const updatedIntent = handlerInput.requestEnvelope.request.intent;
    if (handlerInput.requestEnvelope.request.dialogState != "COMPLETED"){
        // return a Dialog.Delegate directive with no updatedIntent property.
        return handlerInput.responseBuilder
              .addDelegateDirective(updatedIntent)
              .getResponse();
    } else {
      let station = "";
      let query = "";
      station = handlerInput.requestEnvelope.request.intent.slots.location.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      query = handlerInput.requestEnvelope.request.intent.slots.location.resolutions.resolutionsPerAuthority[0].values[0].value.id;
      const response = await httpGet(query);
      var times = tideFormat(response);
      console.log(response);
      let prompt = "The tide times in " + station + " today are: " + times;
      let myDoc = {};
      let myData = {};
      myDoc = require('./results.json');
      myData = {
        "tidalData": {
        "type": "object",
        "properties": {
          "station": station,
          "tides": response
        }
        }
      };
      console.log(myData);
      if(handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL'])
      { 
        return handlerInput.responseBuilder
                .speak(prompt + 'What can I help you with?')
                .reprompt(HELP_MESSAGE)
                .withSimpleCard('Tide Times UK', prompt)
                .addDirective({
                  type: "Alexa.Presentation.APL.RenderDocument",
                  token: 'tidesToken',
                  document: myDoc,
                  datasources: myData
                })
                .getResponse();
      } else {
        return handlerInput.responseBuilder
                .speak(prompt + 'What can I help you with?')
                .reprompt(HELP_MESSAGE)
                .withSimpleCard('Tide Times UK', prompt)
                .getResponse();
      }
    }
  },
};

const GetTidalStationsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'GetTidalStationsIntent'
            || handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent';
  },
  async handle(handlerInput) {
    const updatedIntent = handlerInput.requestEnvelope.request.intent;
    let myDoc = {};
    let myData = {};
    let prompt = COUNTIES_HELP_MESSAGE;
    console.log(handlerInput.requestEnvelope.request);

      if (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent') {
           console.log("hello");
        let station = handlerInput.requestEnvelope.request.arguments[0];
        let query = handlerInput.requestEnvelope.request.arguments[1];
        console.log(station);
        console.log(query);
        const response = await httpGet(query);
        var times = tideFormat(response);
        console.log(response);
        prompt = "The tide times in " + station + " today are: " + times;
        myDoc = require('./results.json');
        myData = {
          "tidalData": {
          "type": "object",
          "properties": {
            "station": station,
            "tides": response
          }
          }
        };
      }
      else {
      let ctyName = handlerInput.requestEnvelope.request.intent.slots.county.resolutions.resolutionsPerAuthority[0].values[0].value.name;
      let COUNTY_STATIONS = [];
      prompt = 'The tidal stations in ' + ctyName + ' are: ';
      console.log(ctyName);
      switch(ctyName.toUpperCase()){
        case 'CORNWALL':
          COUNTY_STATIONS = CORNWALL_STATIONS;
          break;
        case 'BUCKINGHAMSHIRE':
          COUNTY_STATIONS = BUCKS_STATIONS;
          break;
        case 'CAMBRIDGESHIRE':
          COUNTY_STATIONS = CAMBS_STATIONS;
          break;
        case 'CHESHIRE':
          COUNTY_STATIONS = CHES_STATIONS;
          break;
        case 'COUNTY DURHAM':
          COUNTY_STATIONS = DURHAM_STATIONS;
          break;
        case 'CUMBERLAND':
          COUNTY_STATIONS = CUMB_STATIONS;
          break;
        case 'DEVON':
          COUNTY_STATIONS = DEVON_STATIONS;
          break;
        case 'DORSET':
          COUNTY_STATIONS = DORSET_STATIONS;
          break;
        case 'EAST RIDING OF YORKSHIRE':
          COUNTY_STATIONS = ERYORK_STATIONS;
          break;
        case 'EAST SUSSEX':
          COUNTY_STATIONS = ESUS_STATIONS;
          break;
        case 'ESSEX':
          COUNTY_STATIONS = ESSEX_STATIONS;
          break;
        case 'GLOUCESTERSHIRE':
          COUNTY_STATIONS = GLOUC_STATIONS;
          break;
        case 'GREATER LONDON':
          COUNTY_STATIONS = GLON_STATIONS;
          break;
        case 'HAMPSHIRE':
          COUNTY_STATIONS = HAMP_STATIONS;
          break;
        case 'HERTFORDSHIRE':
          COUNTY_STATIONS = HERT_STATIONS;
          break;
        case 'ISLE OF WIGHT':
          COUNTY_STATIONS = IOW_STATIONS;
          break;
        case 'KENT':
          COUNTY_STATIONS = KENT_STATIONS;
          break;
        case 'LANCASHIRE':
          COUNTY_STATIONS = LANC_STATIONS;
          break;
        case 'LINCOLNSHIRE':
          COUNTY_STATIONS = LINC_STATIONS;
          break;
        case 'MERSEYSIDE':
          COUNTY_STATIONS = MERSEY_STATIONS;
          break;
        case 'NORFOLK':
          COUNTY_STATIONS = NORFOLK_STATIONS;
          break;
        case 'NORTH YORKSHIRE':
          COUNTY_STATIONS = NYORKS_STATIONS;
          break;
        case 'NORTHAMPTON':
          COUNTY_STATIONS = NHAMP_STATIONS;
          break;
        case 'NORTHUMBERLAND':
          COUNTY_STATIONS = NHUMB_STATIONS;
          break;
        case 'OXFORDSHIRE':
          COUNTY_STATIONS = OXFORD_STATIONS;
          break;
        case 'SOMERSET':
          COUNTY_STATIONS = SOMER_STATIONS;
          break;
        case 'SUFFOLK':
          COUNTY_STATIONS = SUFFOLK_STATIONS;
          break;
        case 'SURREY':
          COUNTY_STATIONS = SURREY_STATIONS;
          break;
        case 'TYNE AND WEAR':
          COUNTY_STATIONS = TYNE_STATIONS;
          break;
        case 'WEST SUSSEX':
          COUNTY_STATIONS = WSUSSEX_STATIONS;
          break;
        case 'WORCESTERSHIRE':
          COUNTY_STATIONS = WORCES_STATIONS;
          break;  
      }
      let CURRENT_INDEX = 0;
      while (CURRENT_INDEX < COUNTY_STATIONS.length) {
        if(CURRENT_INDEX==COUNTY_STATIONS.length -1) {
          prompt = prompt + COUNTY_STATIONS[CURRENT_INDEX].Name + '. ';
        } else {
          prompt = prompt + COUNTY_STATIONS[CURRENT_INDEX].Name+ ', ';
        }
        CURRENT_INDEX++;
      }
      console.log(prompt);
      myDoc = require('./stations.json');
      myData = {
        "stationsData": {
        "type": "object",
        "properties": {
          "county": ctyName,
          "stations": COUNTY_STATIONS
        }
        }
      };
      
    }  
    if(handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL'])
    {
      return handlerInput.responseBuilder
        .speak(prompt + 'What can I help you with?')
        .reprompt(HELP_MESSAGE)
        .withSimpleCard('Tide Times UK', prompt)
        .withShouldEndSession(false)
        .addDirective({
          type: "Alexa.Presentation.APL.RenderDocument",
          token: 'stationsToken',
          document: myDoc,
          datasources: myData
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(prompt + 'What can I help you with?')
        .reprompt(HELP_MESSAGE)
        .withSimpleCard('Tide Times UK', prompt)
        .withShouldEndSession(false)
        .getResponse();
    }
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    if(handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL'])
    {
      return handlerInput.responseBuilder
        .speak('Welcome to Tide Times. ' + HELP_MESSAGE)
        .reprompt(HELP_MESSAGE)
        .withSimpleCard('Tide Times UK', 'Welcome to Tide Times.')
        .addDirective({
          type: "Alexa.Presentation.APL.RenderDocument",
          document: require('./launchrequest.json'),
          datasources: {}
        })
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak('Welcome to Tide Times. ' + HELP_MESSAGE)
        .reprompt(HELP_MESSAGE)
        .withSimpleCard('Tide Times UK', 'Welcome to Tide Times.')
        .getResponse();
    }
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Tide Times UK';
const HELP_MESSAGE = 'You can say: ask tide times for stations in Cornwall. You can say: ask tide times for tide times in Bude. You can say exit... What can I help you with?';
const COUNTIES_HELP_MESSAGE = 'Currently the available counties are those in England.';
const HELP_REPROMPT = 'You can say: ask tide times for stations in Cornwall. You can say: ask tide times for tide times in Bude. You can say exit..';
const STOP_MESSAGE = 'Goodbye!';
const BUCKS_STATIONS=[{"Name":"Langstone Harbour","Id":"0066"}];
const CAMBS_STATIONS=[{"Name":"Wisbech","Id":"0164A"}];
const CHES_STATIONS=[{"Name":"Bee Ness","Id":"0108A"},{"Name":"Chester","Id":"0462"},{"Name":"Darnett Ness","Id":"0108C"},{"Name":"Fiddler's Ferry","Id":"0456A"},{"Name":"Widnes","Id":"0456"}];
const CORNWALL_STATIONS=[{"Name":"Boscastle","Id":"0544"},{"Name":"Bude","Id":"0543"},{"Name":"Cape Cornwall","Id":"0547A"},{"Name":"Cargreen","Id":"0014B"},{"Name":"Cotehele Quay","Id":"0014C"},{"Name":"Coverack","Id":"0004"},{"Name":"Falmouth","Id":"0005"},{"Name":"Fowey","Id":"0008"},{"Name":"Helford River","Id":"0004A"},{"Name":"Looe","Id":"0011"},{"Name":"Lostwithiel","Id":"0008A"},{"Name":"Lizard Point","Id":"0003"},{"Name":"Mevagissey","Id":"0007"},{"Name":"Newquay","Id":"0546"},{"Name":"Padstow","Id":"0545"},{"Name":"Par","Id":"0007A"},{"Name":"Penzance","Id":"0002"},{"Name":"Perranporth","Id":"0546A"},{"Name":"Port Issac","Id":"0544A"},{"Name":"Porthleven","Id":"0002A"},{"Name":"Saltash","Id":"0014A"},{"Name":"Sennen Cove","Id":"0548"},{"Name":"St. Germans","Id":"0014F"},{"Name":"St. Ives","Id":"0547"},{"Name":"Truro","Id":"0005A"},{"Name":"Wadebridge","Id":"0545A"},{"Name":"Whitsand Bay","Id":"0012"}];
const DURHAM_STATIONS=[{"Name":"Hartlepool","Id":"00188"},{"Name":"Seaham","Id":"0189"}];
const CUMB_STATIONS=[{"Name":"Arnside","Id":"0440A"},{"Name":"BARROW","Id":"0439"},{"Name":"Duddon Bar","Id":"0437"},{"Name":"Hale Head","Id":"0455"},{"Name":"Maryport","Id":"0433"},{"Name":"Roa Island","Id":"0439A"},{"Name":"Silloth","Id":"0432"},{"Name":"Tarn Point","Id":"0436"},{"Name":"Ulverston","Id":"0440"},{"Name":"Whitehaven","Id":"0435"},{"Name":"Workington","Id":"0434"}];
const DEVON_STATIONS=[{"Name":"Appledore","Id":"0536"},{"Name":"Barnstaple","Id":"0539"},{"Name":"Bideford","Id":"0540"},{"Name":"Bovisand Pier","Id":"0015A"},{"Name":"Clovelly","Id":"0541"},{"Name":"CORYTON","Id":"0110A"},{"Name":"DARTMOUTH","Id":"0023"},{"Name":"DEVONPORT","Id":"0014"},{"Name":"Exmouth Dock","Id":"0027"},{"Name":"Fremington","Id":"0538"},{"Name":"Greenway Quay","Id":"0023A"},{"Name":"Ilfracombe","Id":"0535"},{"Name":"Lopwell","Id":"0014D"},{"Name":"Lundy","Id":"0542"},{"Name":"Lynmouth","Id":"0534"},{"Name":"River Yealm Entrance","Id":"0017"},{"Name":"Salcombe","Id":"0020"},{"Name":"Starcross","Id":"0027A"},{"Name":"Start Point","Id":"0021"},{"Name":"Stoke Gabriel","Id":"0023B"},{"Name":"Teignmouth (Approaches)","Id":"0026"},{"Name":"Teignmouth (New Quay)","Id":"0026A"},{"Name":"Topsham","Id":"0027C"},{"Name":"TORQUAY","Id":"0025"},{"Name":"Totnes","Id":"0023C"},{"Name":"Turnchapel","Id":"0015"},{"Name":"Whitaker Beacon","Id":"0121"},{"Name":"Yelland Marsh","Id":"0537"}];
const DORSET_STATIONS=[{"Name":"Bournemouth","Id":"0037"},{"Name":"Bridport","Id":"0029"},{"Name":"Chesil Beach","Id":"0030"},{"Name":"Chesil Cove","Id":"0031"},{"Name":"Christchurch Entrance","Id":"0038"},{"Name":"Christchurch Quay","Id":"0038A"},{"Name":"Tuckton","Id":"0038B"},{"Name":"Cleavel Point","Id":"0036D"},{"Name":"Lulworth Cove","Id":"0034"},{"Name":"Lyme Regis","Id":"0028"},{"Name":"Mupe Bay","Id":"0034A"},{"Name":"Poole Entrance","Id":"0036"},{"Name":"POOLE HARBOUR","Id":"0036A"},{"Name":"PORTLAND","Id":"0033"},{"Name":"Pottery Pier","Id":"0036B"},{"Name":"Swanage","Id":"0035"},{"Name":"Wareham","Id":"0036C"}];
const ERYORK_STATIONS=[{"Name":"Blacktoft","Id":"0179"},{"Name":"Bridlington","Id":"0181"},{"Name":"Brough","Id":"0176A"},{"Name":"GOOLE","Id":"0180"},{"Name":"HULL ALBERT DOCK","Id":"0175"},{"Name":"Hull Alexandra Dock","Id":"0174A"},{"Name":"HULL KING GEORGE DOCK","Id":"0174"},{"Name":"SPURN HEAD","Id":"0171"}];
const ESUS_STATIONS=[{"Name":"Brighton Marina","Id":"0082"},{"Name":"Eastbourne","Id":"0084"},{"Name":"Hastings","Id":"0085"},{"Name":"NEWHAVEN","Id":"0083"},{"Name":"Rye Approaches","Id":"0086"},{"Name":"Rye Harbour","Id":"0086A"},{"Name":"Sovereign Harbour","Id":"0084A"}];
const ESSEX_STATIONS=[{"Name":"Battlesbridge","Id":"0122C"},{"Name":"Bradwell Waterside","Id":"0123"},{"Name":"Brightlingsea","Id":"0126"},{"Name":"BURNHAM-ON-CROUCH","Id":"0122"},{"Name":"Clacton-On-Sea","Id":"0128"},{"Name":"Colchester","Id":"0127"},{"Name":"HARWICH","Id":"0131"},{"Name":"Holliwell Point","Id":"0121A"},{"Name":"Hullbridge","Id":"0122B"},{"Name":"Maldon","Id":"0123B"},{"Name":"Mistley","Id":"0132"},{"Name":"North Fambridge","Id":"0122A"},{"Name":"Osea Island","Id":"0123A"},{"Name":"Rochford","Id":"0121B"},{"Name":"Southend-On-Sea","Id":"0110"},{"Name":"TILBURY","Id":"0111"},{"Name":"WALTON-ON-THE-NAZE","Id":"0129"},{"Name":"West Mersea","Id":"0124"}];
const GLOUC_STATIONS=[{"Name":"Beachley","Id":"0518"},{"Name":"Berkeley","Id":"0522"},{"Name":"Epney","Id":"0522C"},{"Name":"Minsterworth","Id":"0522D"},{"Name":"Sharpness Dock","Id":"0522A"},{"Name":"ST. MARY'S","Id":"0001"},{"Name":"Wellhouse Rock","Id":"0522B"}];
const GLON_STATIONS=[{"Name":"Albert Bridge","Id":"0114"},{"Name":"Chelsea Bridge","Id":"0113A"},{"Name":"LONDON BRIDGE","Id":"0113"},{"Name":"NORTH WOOLWICH","Id":"0112"},{"Name":"Redbridge","Id":"0063"}];
const HAMP_STATIONS=[{"Name":"Bucklers Hard","Id":"0042"},{"Name":"Bursledon","Id":"0063B"},{"Name":"Calshot Castle","Id":"0061"},{"Name":"Hurst Point","Id":"0039"},{"Name":"Lee-On-The-Solent","Id":"0064"},{"Name":"LYMINGTON","Id":"0040"},{"Name":"Northney","Id":"0068A"},{"Name":"PORTSMOUTH","Id":"0065"},{"Name":"PORTSMOUTH HIGH WATER STAND","Id":"0065A"},{"Name":"SOUTHAMPTON","Id":"0062"},{"Name":"WARSASH","Id":"0063A"}];
const HERT_STATIONS=[{"Name":"Jupiter Point","Id":"0014E"}];
const IOW_STATIONS=[{"Name":"Bembridge Approaches","Id":"0053B"},{"Name":"Bembridge Harbour","Id":"0054"},{"Name":"COWES","Id":"0060"},{"Name":"Freshwater Bay","Id":"0048"},{"Name":"Newport","Id":"0060B"},{"Name":"Ryde","Id":"0058"},{"Name":"Sandown","Id":"0053"},{"Name":"Totland Bay","Id":"0046"},{"Name":"Ventnor","Id":"0051"}];
const KENT_STATIONS=[{"Name":"Bartlett Creek","Id":"0108B"},{"Name":"Allington Lock","Id":"0109E"},{"Name":"Bramble Creek","Id":"0129A"},{"Name":"Broadstairs","Id":"0102A"},{"Name":"Chatham","Id":"0109"},{"Name":"Deal","Id":"0098"},{"Name":"DOVER","Id":"0089"},{"Name":"Dungeness","Id":"0087"},{"Name":"Faversham","Id":"0107"},{"Name":"Folkestone","Id":"0088"},{"Name":"Gravesend","Id":"0111A"},{"Name":"Herne Bay","Id":"0104"},{"Name":"MARGATE","Id":"0103"},{"Name":"New Hythe","Id":"0109D"},{"Name":"RAMSGATE","Id":"0102"},{"Name":"Richborough","Id":"0099"},{"Name":"Rochester","Id":"0109B"},{"Name":"SHEERNESS","Id":"0108"},{"Name":"Shivering Sand","Id":"0116A"},{"Name":"Upnor","Id":"0109A"},{"Name":"Whitstable Approaches","Id":"0105"},{"Name":"Wouldham","Id":"0109C"}];
const LANC_STATIONS=[{"Name":"Blackpool","Id":"0445"},{"Name":"Fleetwood","Id":"0444"},{"Name":"Glasson Dock","Id":"0442"},{"Name":"Haws Point","Id":"0439B"},{"Name":"Heysham","Id":"0441"},{"Name":"Lancaster","Id":"0442A"},{"Name":"Morecambe","Id":"0440B"},{"Name":"Preston","Id":"0446"},{"Name":"Wyre Lighthouse","Id":"0443"}];
const LINC_STATIONS=[{"Name":"BOSTON","Id":"0166"},{"Name":"Bull Sand Fort","Id":"0171A"},{"Name":"Burton Stather","Id":"0177"},{"Name":"FLIXBOROUGH WHARF","Id":"0177A"},{"Name":"Humber Bridge","Id":"0176"},{"Name":"IMMINGHAM","Id":"0173"},{"Name":"Keadby","Id":"0178"},{"Name":"Lawyer's Creek","Id":"0164B"},{"Name":"Outer Westmark Knock","Id":"0163"},{"Name":"Owston Ferry","Id":"0178A"},{"Name":"Port Sutton Bridge","Id":"0164"},{"Name":"Skegness","Id":"0167"},{"Name":"Wisbech Cut","Id":"0163A"}];
const MERSEY_STATIONS=[{"Name":"Formby","Id":"0448"},{"Name":"Garston","Id":"0452A"},{"Name":"Hilbre Island","Id":"0461"},{"Name":"LIVERPOOL","Id":"0451"},{"Name":"Southport","Id":"0447"}];
const NORFOLK_STATIONS=[{"Name":"Blakeney","Id":"0155A"},{"Name":"Blakeney Bar","Id":"0155"},{"Name":"Burnham","Id":"0158"},{"Name":"Caister-On-Sea","Id":"0143"},{"Name":"Cromer","Id":"0154"},{"Name":"Great Yarmouth","Id":"0142A"},{"Name":"GORLESTON-ON-SEA","Id":"0142"},{"Name":"Hunstanton","Id":"0161"},{"Name":"King's Lynn","Id":"0162"},{"Name":"Sunk Head","Id":"0130"},{"Name":"Turf Lock","Id":"0027B"},{"Name":"Wells Bar","Id":"0157"},{"Name":"Winterton-On-Sea","Id":"0144"},{"Name":"Yarmouth","Id":"0045"}];
const NYORKS_STATIONS=[{"Name":"Filey Bay","Id":"0182"},{"Name":"Middlesbrough","Id":"0186"},{"Name":"Scarborough","Id":"0183"},{"Name":"Newport Bridge","Id":"0187"},{"Name":"Whitby","Id":"0184"}];
const NHAMP_STATIONS=[{"Name":"Exmouth","Id":"0026B"},{"Name":"Foreland","Id":"0053A"},{"Name":"Grovehurst Jetty","Id":"0106"},{"Name":"Halfway Shoal","Id":"0439C"},{"Name":"HUMBER SEA TERMINAL","Id":"0172A"},{"Name":"Inner Dowsing Light","Id":"0168"},{"Name":"Inward Rocks","Id":"0519"},{"Name":"Minsmere Sluice","Id":"0139A"},{"Name":"Narlwood Rocks","Id":"0520"},{"Name":"Orford Haven Bar","Id":"0136"},{"Name":"RIVER TEES ENTRANCE","Id":"0185"},{"Name":"Seacombe","Id":"0452"},{"Name":"Stansore Point","Id":"0043"},{"Name":"Sunk Dredged Channel","Id":"0171B"},{"Name":"Tabs Head","Id":"0165"}];
const NHUMB_STATIONS=[{"Name":"Amble","Id":"0206"},{"Name":"Berwick","Id":"0209"},{"Name":"BLYTH","Id":"0204"},{"Name":"Coquet Island","Id":"0205"},{"Name":"Holy Island","Id":"0208"},{"Name":"North Sunderland","Id":"0207"}];
const OXFORD_STATIONS=[{"Name":"Folly Inn","Id":"0060A"}];
const SOMER_STATIONS=[{"Name":"AVONMOUTH","Id":"0523"},{"Name":"Bridgwater","Id":"0529"},{"Name":"Burnham-On-Sea","Id":"0528"},{"Name":"Clevedon","Id":"0525"},{"Name":"Cumberland Basin Entrance","Id":"0524"},{"Name":"English And Welsh Grounds","Id":"0526"},{"Name":"Hinkley Point","Id":"0530"},{"Name":"Minehead","Id":"0532"},{"Name":"Porlock Bay","Id":"0533"},{"Name":"Portishead","Id":"0524A"},{"Name":"Sea Mills","Id":"0523B"},{"Name":"Shirehampton","Id":"0523A"},{"Name":"S.E. Long Sand","Id":"0117"},{"Name":"St. Thomas's Head","Id":"0525A"},{"Name":"Watchet","Id":"0531"},{"Name":"Wells","Id":"0157A"},{"Name":"West Stones","Id":"0161A"},{"Name":"Weston-Super-Mare","Id":"0527"},{"Name":"White House","Id":"0521"}];
const SUFFOLK_STATIONS=[{"Name":"Aldeburgh","Id":"0139"},{"Name":"Bawdsey","Id":"0135"},{"Name":"FELIXSTOWE PIER","Id":"0133A"},{"Name":"Iken Cliffs","Id":"0136C"},{"Name":"Ipswich","Id":"0133"},{"Name":"LOWESTOFT","Id":"0141"},{"Name":"Orford Ness","Id":"0137"},{"Name":"Orford Quay","Id":"0136A"},{"Name":"Slaughden Quay","Id":"0136B"},{"Name":"Southwold","Id":"0140"},{"Name":"Woodbridge","Id":"0134A"},{"Name":"Woodbridge Haven","Id":"0134"}];
const SURREY_STATIONS=[{"Name":"Hammersmith Bridge","Id":"0115"},{"Name":"Kew Bridge","Id":"0115A"},{"Name":"Richmond Lock","Id":"0116"}];
const TYNE_STATIONS=[{"Name":"Newcastle-Upon-Tyne","Id":"0203"},{"Name":"NORTH SHIELDS","Id":"0202"},{"Name":"SUNDERLAND","Id":"0190"}];
const WSUSSEX_STATIONS=[{"Name":"Arundel","Id":"0074B"},{"Name":"Bognor Regis","Id":"0073"},{"Name":"Bosham","Id":"0068B"},{"Name":"CHICHESTER HARBOUR","Id":"0068"},{"Name":"Dell Quay","Id":"0068D"},{"Name":"Itchenor","Id":"0068C"},{"Name":"Littlehampton","Id":"0074"},{"Name":"Nab Tower","Id":"0070"},{"Name":"Pagham","Id":"0072"},{"Name":"Selsey Bill","Id":"0069"},{"Name":"SHOREHAM","Id":"0081"},{"Name":"Worthing","Id":"0075"}];
const WORCES_STATIONS=[{"Name":"EASTHAM","Id":"0453"}];
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetTidalDataHandler,
    GetTidalStationsHandler,
    LaunchRequestHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
  
  // returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay(handlerInput) {
  var hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
  console.log("Supported Interfaces are" + JSON.stringify(handlerInput.requestEnvelope.context.System.device.supportedInterfaces));
  return hasDisplay;
}

const Background = {
      title: 'acg1',
      url: 'https://s3.amazonaws.com/benthambookkeeping.co.uk/background.jpg'
};
