function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...document.querySelectorAll(`meta[${attr}="${name}"]`)]
    .map((m) => m.content)
    .join(', ');
  return meta || '';
}

//const aem = "http://localhost:4503";
//const aem = "https://publish-p107058-e1001010.adobeaemcloud.com";
  const aem = "https://author-p72302-e634773.adobeaemcloud.com";

export default function decorate(block) {


  const slugDiv = block.querySelector('div:nth-child(1)'); 
  const slugID = document.createElement('div');
  slugID.id = 'slug';
  slugDiv.replaceWith(slugID);
  slugID.innerHTML = `${slugDiv.innerHTML}`;
  const slugTemp = slugID.innerHTML.replace(/<div>|<\/div>/g, '');
  const slug = slugTemp.match(/\S+/g);
  
  const quoteDiv = block.querySelector('div:last-of-type');
  const adventureDiv = document.createElement('div');
  adventureDiv.id = "adventure-" + slug; 
  quoteDiv.replaceWith(adventureDiv);

  /* RUG */
  const slug2 = slug[3].slice(slug[3].indexOf('>')+1,slug[3].indexOf('<'));
  /* const requestRUG = aem + '/graphql/execute.json/aem-demo-assets/adventure-by-slug;slug=' + slug2; */
  const requestRUG = aem + '/graphql/execute.json/bs/article-by-slug;slug=' + slug2;
  
  console.log(slug2);
  console.log(requestRUG);

  //fetch(aem + '/graphql/execute.json/aem-demo-assets/adventures-by-slug;slug=' + slug)
fetch(aem + '/graphql/execute.json/bs/article-by-slug;slug=' + slug2)
.then(response => response.json())
.then(response => {

//const backgroundImage = response.data.adventureList.items[0].PrimaryImage._publishUrl;
const backgroundImage = response.data.articleList.items[0].image._publishUrl;
document.getElementById(adventureDiv.id).innerHTML = "<section><img src=" + backgroundImage + "></section>";  

//const adventureTitle = response.data.adventureList.items[0].title;
const adventureTitle = response.data.articleList.items[0].title;
document.getElementById(adventureDiv.id).innerHTML += "<section><h3>"+ adventureTitle + "</h3></section>";

//const adventureDesc = response.data.adventureList.items[0].description.plaintext;
const adventureDesc = response.data.articleList.items[0].main.plaintext;
document.getElementById(adventureDiv.id).innerHTML += "<section>" + adventureDesc + "</section>";

const adventureType = response.data.adventureList.items[0].adventureType;
document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Adventure Type: " + adventureType + "</section>";

const tripLength = response.data.adventureList.items[0].tripLength;
document.getElementById(adventureDiv.id).innerHTML += "<section>" +"Trip Length: " + tripLength + "</section>";

const tripDifficulty = response.data.adventureList.items[0].difficulty;
document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Difficulty: " + tripDifficulty + "</section>";

const groupSize = response.data.adventureList.items[0].groupSize;
document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Group Size: " + groupSize + "</section>";

const tripItinerary= response.data.adventureList.items[0].itinerary.html;
document.getElementById(adventureDiv.id).innerHTML += "<section>" + "Itinerary: </br>" + tripItinerary + "</section>";

})
.catch(error => {
  console.log('Error fetching data:', error);
});

}