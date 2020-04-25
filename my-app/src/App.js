import React from "react";
import './index.css'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

var recipeObject = null;
var container = null;

export default function App() {
  React.useEffect(() => {
	if(document.getElementById("submitButton") != null) {
		document.getElementById("submitButton").onsubmit = function(e) {
			e.preventDefault();
		}
		document.getElementById("submitButton").onclick = function() {
			let obj = formObjectLoaded();
			httpPost('http://localhost:3001/recipes', obj); 
			window.location.href='http://localhost:3000/recipes/'+obj.id;
		}
	}
	
	if(document.getElementById("submitButtonE") != null) {
		document.getElementById("submitButtonE").onsubmit = function(e) {
			e.preventDefault();
		}
		document.getElementById("submitButtonE").onclick = function() {
			let obj = formObjectLoaded();
			obj.id = window.location.pathname.split('/').slice(-1);
			httpPut('http://localhost:3001/recipes/'+obj.id, obj); 
			window.location.href='http://localhost:3000/recipes/'+obj.id;
		}
	}
	
	container = document.getElementById("container");
  }, []);
  
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/recipes">All recipes</Link>
            </li>
            <li>
              <Link to="/add">Add recipe</Link>
            </li>
          </ul>
        </nav>
		
		<div class="background masonry-container1">
		
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
		  <Route path="/recipes/:recipeId" component={RecipeId} />
		  <Route path="/recipes">
            <Recipes />
          </Route>
          <Route path="/add">
            <Add />
          </Route>
		  <Route path="/edit/:recipeId" component={Edit} />
          <Route exact path="/">
            <Recipes />
          </Route>
        </Switch>
		
		</div>
      
	  </div>
    </Router>
  );
}

function componentDidMount() {
    let url = "http://localhost:3001/recipes"
    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        let posts = data.map((post, index) => {
          return (

            <div key={index}>
              <h3>{post.title}</h3>
              <p>Tags: {post.tags}</p>
            </div>

          )
        })
        this.setState({posts: posts});
      })
}

function Recipes() {
  let res = [];
  let recipes = JSON.parse(httpGet("http://localhost:3001/recipes"));
  
  function sortByDate(a, b) {
	  let aD = a.createDate.split('-');
	  let bD = b.createDate.split('-');
	  
	  if(aD[2]-bD[2] == 0) {
		  if(aD[1]-bD[1] == 0) {
			if(aD[0]-bD[0] == 0) {
			  return 0;
			} else {
			  return aD[0]-bD[0];
			}
		  } else {
			return aD[1]-bD[1];
		  }
	  } else {
		  return aD[2]-bD[2];
	  }
  };
  
  recipes.sort(function(a, b) {
	  if(localStorage.getItem("filterDate") == 'true')
		return sortByDate(a,b)
	  return -sortByDate(a,b)
  });
  
  if(localStorage.getItem("filterCategory") != 'All')
	recipes = recipes.find(a => (a.category==localStorage.getItem("filterCategory")));
  
  if(recipes == undefined)
	recipes = [];

  if(!Array.isArray(recipes))
	recipes = [recipes];

  let categories = JSON.parse(httpGet("http://localhost:3001/categories"))
  let categoriesDOM = []
  
  categoriesDOM.push(<option>All</option>);
  
  for (let i = 0; i < categories.length; i++) {
	if(categories[i]==localStorage.getItem("filterCategory")) {
		categoriesDOM.push(<option selected>{categories[i]}</option>);
		continue;
	}
		
	categoriesDOM.push(<option>{categories[i]}</option>)
  }
  
  //date sort options
  let dateOptions = [];
  if(localStorage.getItem("filterDate") == 'true') {
	  dateOptions.push(<option>Newest</option>);
	  dateOptions.push(<option selected>Oldest</option>);
  } else {
	  dateOptions.push(<option selected>Newest</option>);
	  dateOptions.push(<option>Oldest</option>);
  }
  
  res.push(
	<div class="filterBox">
		Sort by: 
		<select id="filterDate" onChange={ event =>  {
			if(document.getElementById("filterDate").selectedIndex==0) {
				localStorage.setItem("filterDate", false);
			} else {
				localStorage.setItem("filterDate", true);
			}
			document.location.reload();
		}}> { dateOptions } </select>
		
		Filter: 
		<select id="filterCategories" onChange={ event =>  {
			
			let categories = document.getElementById("filterCategories");
			localStorage.setItem("filterCategory", categories.options[categories.selectedIndex].value);
			
			document.location.reload();
		}}>{ categoriesDOM }</select>
		
		<span class="floatRight">
			Find: 
			<input type="text" id="fname" name="fname"/>
			<button onClick={ event =>  {
				//document.location.reload();
				
				let value = document.getElementById("fname").value;
				
				if(value==null)
					return;
				
				let recipes = JSON.parse(httpGet("http://localhost:3001/recipes"));
				
				recipes = getAllIndexes(recipes, value);
				alert(JSON.stringify(recipes));
				let children = container.childNodes;
				
				//children = children.slice(recipes)
				
				let children2 = [];
				for(let i=0; i<children.length; ++i) {
					if(!recipes.includes(i))
						children2.push(children[i+2]);
				}
				children2.pop();
				children2.pop();
				
				alert(children2);
				for(let i=0; i<children2.length; ++i) {
					container.removeChild(children2[i]);
				}
				
			}}>Search</button>
		</span>
	</div>
  );
  
  res.push(
	<div class="recipe add masonry-brick1" onClick={
		event =>  {
			window.location.href='http://localhost:3000/add'; 
			event.stopPropagation()
		}
	}>
		<img class="center" src="https://s3.us-east-2.amazonaws.com/upload-icon/uploads/icons/png/20340289291547546467-256.png" />
	</div>);
  
  for (let i = 0; i < recipes.length; i++) {
    res.push(
	<div class="recipe masonry-brick1" onClick={event =>  {window.location.href='http://localhost:3000/recipes/'+recipes[i].id; event.stopPropagation()}}>
		<div class="clearfix">
			<img align="left" src="https://image.flaticon.com/icons/png/512/100/100417.png" />
			
			<img align="right" onClick={
				event =>  {
					event.stopPropagation(); 
					
					if(!window.confirm("You are about to delete "+recipes[i].name+". Proceed?"))
						return;
					
					httpDelete('http://localhost:3001/recipes/'+recipes[i].id); 
					event.currentTarget.parentElement.parentElement.parentElement.removeChild(event.currentTarget.parentElement.parentElement);
				}
			} src="https://image.flaticon.com/icons/png/512/61/61848.png" />
			
			<img align="right" onClick={
				event =>  {
					window.location.href='http://localhost:3000/edit/'+recipes[i].id; 
					event.stopPropagation()
				}
			} src="https://cdn.onlinewebfonts.com/svg/img_147067.png" />
			
			<b>{ recipes[i].name }</b> ({ recipes[i].category })
			<span class="floatRight"><i>{ recipes[i].createDate }</i></span><br/>
			<i>{ recipes[i].shortDesc }</i>
			<div class="clear"/>
		</div>
	</div>)
  }
  
  return (<div id="container">{ res }</div>);
}

function RecipeId({ match }) {
	let recipe = JSON.parse(httpGet("http://localhost:3001/recipes/"+match.params.recipeId));
	let res = 
	<div class="recipe inspect">
		<div class="clearfix">
		<img align="left" src="https://image.flaticon.com/icons/png/512/100/100417.png" />
		
		<img align="right" onClick={
			event =>  {
				event.stopPropagation(); 
				
				if(!window.confirm("You are about to delete "+recipe.name+". Proceed?"))
					return;
				
				httpDelete('http://localhost:3001/recipes/'+match.params.recipeId); 
				event.currentTarget.parentElement.parentElement.parentElement.removeChild(event.currentTarget.parentElement.parentElement);
			}
		} src="https://image.flaticon.com/icons/png/512/61/61848.png" />
		
		<img align="right" onClick={
			event =>  {
				window.location.href='http://localhost:3000/edit/'+match.params.recipeId; 
				event.stopPropagation()
			}
		} src="https://cdn.onlinewebfonts.com/svg/img_147067.png" />
		
		<b>{ recipe.name }</b> ({ recipe.category })
		<span class="floatRight"><i>{ recipe.createDate }</i></span><br/>
		<i>{ recipe.shortDesc }</i>
		<div class="clear"/>
		<div class="recipeLong">{ recipe.longDesc }</div>
		</div>
	</div>
	return res;
}

function Add() {

  let categories = JSON.parse(httpGet("http://localhost:3001/categories"));
  let categoriesDOM = [];
  
  for (let i = 0; i < categories.length; i++) {
	categoriesDOM.push(<option>{categories[i]}</option>)
  }
	
  let res = 
  <div class="editForm">
	<p>
	  <h1 align="center">Add recipe</h1>
	  <b>Recepy name: </b> <br/>
	  <input id="name" required type="text" /> <br/>
	  <b>Category: </b> <br/>
	  <select id="category"> { categoriesDOM } </select> <br/> 
	  <b>Short description: </b> <br/>
	  <textarea id="shortDesc" cols="40" rows="3"/> <br/>
	  <b>Long description: </b> <br/>
	  <textarea id="longDesc" cols="40" rows="10"/> <br/>
	  <input id="submitButton" type="submit" value="Додати" />
	  <input id="returnButton" type="submit" value="Відхилити" onClick={() => {window.history.back();}} />
	</p>
  </div>
	
  return res;
}

function Edit({ match }) {
  let recipe = JSON.parse(httpGet("http://localhost:3001/recipes/"+match.params.recipeId));
  let categories = JSON.parse(httpGet("http://localhost:3001/categories"));
  let categoriesDOM = [];
  
  for (let i = 0; i < categories.length; i++) {
	categoriesDOM.push(<option>{categories[i]}</option>)
  }
	
  let res = 
  <div class="editForm">
	<p>
	  <h1 align="center">Edit recipe</h1>
	  <b>Recepy name: </b> <br/>
	  <input id="name" required type="text" defaultValue={recipe.name} /> <br/>
	  <b>Category: </b> <br/>
	  <select id="category"> { categoriesDOM } </select> <br/> 
	  <b>Short description: </b> <br/>
	  <textarea id="shortDesc" cols="40" rows="3">{recipe.shortDesc}</textarea> <br/>
	  <b>Long description: </b> <br/>
	  <textarea id="longDesc" cols="40" rows="10">{recipe.shortDesc}</textarea> <br/>
	  <input id="submitButtonE" type="submit" value="Додати" />
	  <input id="returnButton" type="submit" value="Відхилити" onClick={() => {window.history.back();}} />
	</p>
  </div>
	
  return res;
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function formObjectLoaded() {
	var recipes = JSON.parse(httpGet("http://localhost:3001/recipes"));
	var today = new Date();
	var obj = {
      "id": recipes[recipes.length-1].id+1,
      "name": document.getElementById("name").value,
      "category": document.getElementById("category").value,
	  "shortDesc": document.getElementById("shortDesc").value,
	  "longDesc": document.getElementById("longDesc").value,
	  "createDate": ''+today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear()
    }
	return obj;
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i].name.toLowerCase().includes(val.toLowerCase()))
            indexes.push(i);
    return indexes;
}

function httpPost(theUrl, obj) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", theUrl, true ); // false for synchronous request
	xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xmlHttp.send( JSON.stringify(obj) );
    return xmlHttp.responseText;
}

function httpPut(theUrl, obj) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "PUT", theUrl, true ); // false for synchronous request
	xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    xmlHttp.send( JSON.stringify(obj) );
    return xmlHttp.responseText;
}

function httpDelete(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "DELETE", theUrl, true );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}