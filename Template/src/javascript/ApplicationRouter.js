var Backbone = require('backbone');
var _ = require('underscore');
var OnPageView = require('./OnPageView');
var TemplatedView = require('./TemplatedView');

module.exports = Backbone.Router.extend({

	initialize: function(el) {
		this.el = el;
	},

	currentView: null,
	pastView: null,

	routes: {
		"": "changeView",
    ":type/:id" : "changeView",
		"*else": "notFound",
	},

	switchView: function(view) {
    var previous = this.currentView;
		if (previous) {
			// Detach the old view
      previous.transitionOut(function(){
        previous.remove();
      });

		  //add past view
		  this.pastView = previous;
      // Move the view element into the DOM (replacing the old content)
		  this.el.prepend(view.el);
    }
    else{
      //if no previous view existed, totally replace contents in dom
      this.el.html(view.el);
    }

		// Render view after it is in the DOM (styles are applied)
		view.render();
		this.currentView = view;
    this.currentView.transitionIn();

	},

	/*
	 * Change the active element in the topbar
	 */
	changeView: function(type, id){
    // Check for empty case
    var pUrl;
    if (!type && !id)
    {
      pUrl = 'header.html';
    } else {
      pUrl = type +"/"+ id + '.html';
    }
    console.log("Path: " + pUrl);
    //$('.loading-screen').fadeIn(400);
    // Make a reference to router itself
    // Fuck this. no like seriously, fuck this
    var router = this;

		this.showLoader();

    $.ajax({
      url: pUrl,
      dataType: 'text',
      cache: true,
      success: function(data){
        router.addedView = new TemplatedView({template:data, data:{}, routeId:type +"/"+ id});
        router.switchView(router.addedView);
				_.delay(router.hideLoader, 500);
      },
      error: function(){ // [TODO] eeewwww this code is not DRY
        router.addedView = new OnPageView({template:"#404"});
        router.switchView(router.addedView);
				_.delay(router.hideLoader, 500);
      },
      progress: function(){

      },
    });

		// [TODO] [REFACTOR] quick code to hide the menu whenever switching view
		document.getElementById("prBox").className = "overlayMenu";
		document.getElementById("menuBTN").className = "";
	},

  clear: function(){
    this.addedView = new OnPageView({}); // renders empty html
    this.switchView(this.addedView);
  },

	notFound: function() {
		_.delay(this.hideLoader, 500);
		this.addedView = new OnPageView({template:"#404"});
		this.switchView(this.addedView);
	},

	showLoader: function() {
		document.getElementById("loader-wrapper").className = "active";
	},
	hideLoader: function() {
		movetoEl('#content-wrapper');
		document.getElementById("loader-wrapper").className = "inactive";
	}

});
