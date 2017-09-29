$(document).ready(main);

var currentTerm = null;



function main(){

    resetNavBar();

    $("body").on("click", function(){
        $("#error, #message").text("");
    });


	$("#search-button").on("click", function(){
        search();
    });


	$("body").on("click", ".term-link", function(){
		var term = this.getAttribute("id");
        $("#search-bar").val(term);
		currentTerm = term;
		getDefinition(term);
	});

    $("body").on("click", ".term-suggestion-link", function(){
        $("#term-suggestions-section").empty();
        $("#term-suggestions-section").hide();
        var term = this.getAttribute("id");
        $("#definition-term-textarea").val(term)
    });


/* LISTENERS */

	$("body").on("keydown", function(e){
	    if(e.which == 13){
	        search();
	    }

        if(e.which == 27){
            $("#new-definition").hide();
        }
	});

	$("#search-bar").on("keyup", function(e){
		if($("#search-bar").val().length > 2){
	    	search();
		} else {
			$("#terms-section").empty();
		}

		if(e.which == 8){
			$("#new-definition").hide();
            $("#definitions-section").empty();
			console.log("8! Say 8! I'm an 8 again!");
		}
	});


    $("#definition-term-textarea").on("keyup", function(e){
        if($("#definition-term-textarea").val().length > 2){
            $("#term-suggestions-section").empty();
            $("#term-suggestions-section").show();
            searchForDefinitions();
        } else {
            $("#term-suggestions-section").hide();
        }

        if(e.which == 8){
            $("#term-suggestions-section").empty();
            console.log("8! Say 8! I'm an 8 again!");
        }
    });




	$("#new-definition-textarea").on("keyup", function(){
		$("#new-definition-char-count").text($("#new-definition-textarea").val().length);
	})

	$("body").on("click", "#add-definition", function(){
		addDefinition();
	});

    $("body").on("click", ".voting-button", function(){
        var type = this.dataset.vote;               // quick way to get data attribute value
        var id = this.parentElement.parentElement.previousSibling.previousSibling.parentElement.id;
        var term = this.parentElement.parentElement.previousSibling.previousSibling.childNodes[1].innerHTML;


        console.log(term);

        voteOnDefinition(type, id, term);
    })

    $("body").on("click", "#add-def-link", function(){
        $("#new-definition").show();
        $("#new-definition-textarea").focus();
        $("#definition-term-textarea").val(currentTerm);
        $("#definition-term-textarea").prop('disabled', true);
        $("#definition-term-textarea").css("background", "gray").css("color", "#3c3c3c");
        $("#terms-section").empty();
    });

    $("body").on("click", "#new-def-link", function(){
        $("#new-definition").show();
        $("#definition-term-textarea").val($("#search-bar").val());
        $("#definition-term-textarea").focus();
        $("#terms-section").empty();
    });
    
    $("body").on("click", "#new-definition-close", function(){
        $("#new-definition").hide();
    });

    /* ACCOUNT LINKS*/

    $("body").on("click", "#login", function(){
        showLogin();
    });

    $("body").on("click", ".log-in-link", function(){
        $(".pop-out").hide();
        $("#terms-section").empty();
        showLogin();
    });

    $("body").on("click", ".sign-up-link", function(){
        $(".pop-out").hide();
        $("#terms-section").empty();
        showSignup();
    });

    $("body").on("click", "#signup", function(){
        showSignup();
    });

    $("body").on("click", "#account-close", function(){
        resetNavBar();
    });

    $("body").on("click", "#login-action", function(){
        login();
    });

    $("body").on("click", "#signup-action", function(){
        signup();
    });

    $("body").on("click", "#logout", function(){
        logout();
    });

}





/* FUNCTIONS */

function resetNavBar(){
    $("#login-username, #login-password, #signup-username, #signup-password").val("");
    $("#login-section").hide();
    $("#signup-section").hide();
    $("#login, #signup").show();
}

function showLogin(){
    $("#login, #signup").hide();
    $("#signup-section").hide();
    $("#login-section").show();
    $("#login-username").focus();
}

function showSignup(){
    $("#login, #signup").hide();
    $("#login-section").hide();
    $("#signup-section").show();
    $("#signup-username").focus();
}





function search(){
	var serchTerm = $("#search-bar").val().trim();

    if(serchTerm){

    	var searchQuery = {
    		term: serchTerm.toLowerCase()
    	}

    	$.ajax({
            type: "post",
            data: searchQuery,
            url: "/search",
            success: function(result){
            	if(result.status == "success"){
            		$("#terms-section").empty();
            		console.log("Found " + result.count + " responses");

            		if(result.count > 0){
                        $("#definitions-section").empty();

                        if(result.count == 1){                          // if there's only one term, display the definition
                            getDefinition(result.body[0].name);
                            currentTerm = result.body[0].name;
                        } else {
                            result.body.forEach(function(term){
                                displaySearchTerm(term);
                            });
                        }

            		} else {
                        if($("#definitions-section").height() > 0){
                            console.log("updating non-existent term");
                            $(".no-def-term").text(serchTerm);
                        } else {
                            console.log("adding div");
                            $("#definitions-section").append("<div class = 'definition'>There are no definitions for <span class = 'bold no-def-term'>" + serchTerm + "</span>. <span class = 'link bold' id = 'new-def-link'>Want to add one<span>?</div></div>");
                        }
                    }      		
            	} else {
            		console.log(result.error)
            	}
            }
        })
    } else {
    	console.log("you're not searching for anything!");
    }
}

function searchForDefinitions(){
    var serchTerm = $("#definition-term-textarea").val().trim();

    if(serchTerm){
        var searchQuery = {
            term: serchTerm.toLowerCase()
        }

        $.ajax({
            type: "post",
            data: searchQuery,
            url: "/search",
            success: function(result){
                if(result.status == "success"){
                    $("#term-suggestions-section").empty();

                    result.body.forEach(function(term){
                        displayDefinitionSuggestion(term);
                    });
                                                       
                } else {
                    console.log(result.error)
                }
            }
        })
    } else {
        console.log("you're not searching for anything!");
    }
}

function getDefinition(thisTerm){

	var searchQuery = {
		term: thisTerm.toLowerCase()
	}

	$.ajax({
        type: "post",
        data: searchQuery,
        url: "/get-definitions",
        success: function(result){
        	if(result.status == "success"){
                console.log(result);
        		$("#terms-section").empty();
            	if(result.count > 0){
            		$("#definitions-section").empty();
                    displayDefinitionsOnPage(result.body);
	            } else {
	            	$("#definitions-section").append("<div class = 'definition'>There are no definitions for <span class = 'bold'>" + thisTerm + "</span>. <span class = 'link bold' id = 'add-def-link'>Want to add one<span>?</div></div>");
	            }
        	} else {
        		console.log(result.error)
        	}
        }
    })
}

function addDefinition(){

    var definitionTerm = $("#definition-term-textarea").val();
	var definitionBody = $("#new-definition-textarea").val();
	var relatedTerms = $("#new-definition-related-terms").val();

    if(definitionBody.trim()){

    	var related = trimRelatedTerms();

    	var definitionData = {
			term: definitionTerm.toLowerCase().trim(),
			definition: definitionBody,
			related: relatedTerms
		}

        console.log(definitionData);
	    
		$.ajax({
	        type: "post",
	        data: definitionData,
	        url: "/new-definition",
	        success: function(result){
	        	if(result.status == "success"){
            		$("#terms-section").empty();
            		$("#definitions-section").empty();
            		$("#definitions-section").append("<div class = 'definition'>Your definition for <span class = 'bold'>" + result.term + "</span> has been submitted.</div>");
            		getDefinition(result.term);
                    $("#new-definition-textarea").val("");            
                    $("#new-definition").hide();
	        	} else {
	            	$("#definitions-section").empty();
	            	$("#definitions-section").append("<div class = 'definition'>" + result.error + "</div>");
	     		}
	        }
	    })
	}
}

function voteOnDefinition(voteType, elementId, voteTerm){

    var votingData = {
        id: elementId,
        type: voteType,
    }
    
    $.ajax({
        type: "post",
        data: votingData,
        url: "/vote",
        success: function(result){

            console.log(result);

            if(result.status == "success"){  
                getDefinition(voteTerm);  
                console.log(result.message);
            } else {
                console.log("something went wrong");
                $("#error").text(result.error);
            }
        }
    })
}


function login(){

    var loginData = {
        username: $("#login-username").val(),
        password: $("#login-password").val()
    }

    if(loginData.username.trim().length && loginData.password.trim().length){
        $.ajax({
            type: "post",
            data: loginData,
            url: "/login",
            success: function(result){
                if(result.status == "success"){
                    location.reload();
                } else {
                    $("#login-username, #login-password, #signup-username, #signup-password").val("");
                    $("#error").text(result.message);
                }
            }
        })
    } else {
        console.log("invalid login");
        $("#message").text("Username or password can't be blank");
    }

}


function signup(){

    var signupData = {
        username: $("#signup-username").val(),
        password: $("#signup-password").val()
    }


    if(signupData.username.trim().length){
        $.ajax({
            type: "post",
            data: signupData,
            url: "/signup",
            success: function(result){
                if(result.status == "success"){
                    resetNavBar();
                    $("#message").text(result.message);
                } else {
                    $("#login-username, #login-password, #signup-username, #signup-password").val("");
                    $("#error").text(result.message);
                }
            }
        })
    } else {
        console.log("invalid signup");
        $("#message").text("Username or password can't be blank");
    }
}

function logout(){

    $.ajax({
        type: "get",
        url: "/logout",
        success: function(result){
            if(result.status == "success"){
                location.reload();
            } else {
                $("#login-username, #login-password, #signup-username, #signup-password").val("");
            }
        }
    })
 
}



function displayDefinitionsOnPage(definitions){

   

    definitions = sortDefinitions(definitions);

    // a bit of handlebars magic

    $.get('views/components/definition.html', function(data) {

        $("#definitions-section").prepend("<h3>Popular definitions</h3>");

        definitions.forEach(function(definition, addLast){
            var score = definition.upvotes - definition.downvotes;

            var myTemplate =  Handlebars.compile(data);

            var context={
                term: definition.term,
                body: definition.body,
                score: score,
                id: definition.id
              };

              var compiled = myTemplate(context)

              $("#definitions-section").append(compiled);
        });

        $("#definitions-section").append("<div class = 'definition'>Don't see a good definition? <span class = 'link bold' id = 'add-def-link'>Add your own!<span></div>");

    }, 'html')
}


function sortDefinitions(definitions){

    var sortedDefinitions = [];

    while(sortedDefinitions.length < definitions.length){                    // DANGER ALERT!
        var maxScore = -999;

        for(var i = 0; i < definitions.length; i++){

            var score = definitions[i].upvotes - definitions[i].downvotes;

            if(score > maxScore && sortedDefinitions.indexOf(definitions[i]) == -1) { maxScore = score}

        }

        for(var j = 0; j < definitions.length; j++){

            var score = definitions[j].upvotes - definitions[j].downvotes;

            if(score == maxScore){
                sortedDefinitions.push(definitions[j]);
            }
        }
    }

    return sortedDefinitions;
}




function displaySearchTerm(term){
	$("#terms-section").append("<div class = 'term'><span class = 'title'><span id = '" + term.name + "' class ='term-link'>" + term.name + "</span></span></div>");
} 

function displayDefinitionSuggestion(term){
    $("#term-suggestions-section").append("<div class = 'term'><span class = 'title'><span id = '" + term.name + "' class ='term-suggestion-link'>" + term.name + "</span></span></div>");
} 


function displayAddDefinition(term){
	$("#new-definition").show();
    $("#new-definition-textarea").focus();
	currentTerm = term;
}



function trimRelatedTerms(){

}