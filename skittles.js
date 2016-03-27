
angular.module('app',[])
.controller('controller',function($scope,serviceTickets,serviceTicket,serviceStatus,serviceGrouping,$timeout){
  $scope.title="Skittles";
  $scope.selected={
     set:""
    ,group:""
    ,ticket:""
  };

  $scope.ticket=null;
  $scope.statuses={};

  $scope.panel={
     "menus":true
    ,"tickets":true
    ,"ticket":true
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  $scope.setError=function(message){
    console.log("ERROR");
    console.log(message);
  };
  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  function showMenuLoading(show) {
    if(show === false)
      return $('#menus .loading-mask').css('visibility','hidden');
    
    return $('#menus .loading-mask').css('visibility');
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  $scope.groups={};
  $scope.group={
     by:"status"
    ,options:{
       "span":"Date Span"
      ,"status":"Status"
      ,"client":"Client"
    }
    ,setGroup:function(group) {
      if(!group) group=$scope.group.by;
      
      showMenuLoading();
      serviceGrouping.getGrouping(group, $scope.tickets)
      .then(function(groups){
        console.log("groups.set");
        console.log($scope.tickets);

        $scope.groups=groups;
        $scope.$apply();

        showMenuLoading(false);
      })
      .catch(function(error){
        $scope.setError(error);
      });
    }
  };

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  // get tickets
  serviceTickets.getTickets($scope.userId)
  .then(function(tickets) {
    $scope.tickets=tickets;
    // get all possible status
    return serviceStatus.getStatus();
  })
  .then(function(data){
    $scope.statuses=data;
    $scope.$apply();
    // determine the grouping
    $scope.group.setGroup();
  })
  .catch(function(error){
    $scope.setError(error);
  });

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  $scope.getStatus=function(id) {
    if (!$scope.statuses[id]) 
      return "";

    return $scope.statuses[id];
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  $scope.addComments=function() {
    var top=$('td#frame .ticket #comment').position().top;
    var ticket=$('td#frame .ticket');

    ticket.animate({
      scrollTop: ticket.scrollTop()+top
    },500);
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  /**
   * show the group menu
   * @param {object} $event the event 
   * @return void
   **/
  $scope.showGroupMenu=function($event) {
    console.log("showGroupMenu()")
    console.log($event);
    console.log($event.currentTarget);
    $('.sort_menu')
      .css('top',$event.clientY+$event.offsetY)
      .css('left',$event.clientX+$event.offsetX);

    $scope.toggleGroupMenu(false);
  }

  $scope.isGroupMenuVisible=function() {
    console.log("menu visibility: %s", $('.sort_menu').css('visibility')=="visible");
    return $('.sort_menu').css('visibility')=="visible";
  }

  /**
   * to toggle the group menu
   * @param {boolean} [hide] true to hide the menu else determine it with respect to value
   **/
  $scope.toggleGroupMenu=function(hide) {
    var visibility=$('.sort_menu').css('visibility');
    var hidden="visible";

    if(hide == true)
      hidden="hidden";
    /*
    else if(visibility == "visible" || !visibility)
      hidden="hidden";
    */

    console.log("setting menu as '%s'",hidden);
    $('.sort_menu').css('visibility',hidden);
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  /**
   * scroll the ticket group to the top
   * @param {string} group the group ID
   * @return void
   **/
  $scope.selectGroup=function(group) {
    var top=$('.tickets_area td#tickets_column .column .content div.'+group).position().top;
    var tickets=$('.tickets_area td#tickets_column .column .content');

    tickets.animate({
      scrollTop: tickets.scrollTop()+top
    }, 500);
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  /**
   * select a ticket given its ticket number
   * @param {string} ticketId the ticket number
   * @return void
   **/
  $scope.selectTicket=function(ticketId) {
    console.log("ticket seleted: %s", ticketId);
    if ($scope.view=="inline") {
      //collapse ticket list
      $scope.togglePanel('tickets',false);
      $scope.togglePanel('ticket',true);
    }

    var loading=$('td#frame div.loading-mask').css('visibility','visible');

    serviceTicket.getTicket(ticketId).then(function(data){
      $scope.ticket=data;
      $scope.$apply();
      $('td#frame div.ticket').scrollTop(0);
      loading.css('visibility','hidden');
    }).catch(function(error){

    });
  }

  /**
   * create a new ticket
   * @return void
   **/
  $scope.newTicket=function(){

  }


  /**
   * toggle the menus panel
   * @param {string} name the panel name
   * @param {boolean} [doEnable] true to enable, false to 
   *  disable else determine it in respect to last set value
   * @return void
   **/
  $scope.togglePanel=function(name,doEnable) {
    if(typeof $scope.panel[name] == "undefined") return;
    if(typeof doEnable == "undefined")
      doEnable=!$scope.panel[name];


    console.log('togglePanel():: flipping panel %s from %s to %s',name,$scope.panel[name],doEnable);
    $scope.panel[name]=doEnable;
  }


  $scope.togglePanelTickets=function(){
    if($scope.view=="inline")
      return $scope.setViewInline();
    return $scope.togglePanel('tickets');
  }

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  /**
   * show tickets in a vertical view
   * @return void
   **/
  $scope.setViewVertical=function() {
    $scope.view="vertical";
    $scope.togglePanel("tickets",true);
    $scope.togglePanel("ticket",true); 
    $('table.tickets_area').removeClass('view_inline');
  }

  /**
   * show tickets in a inline view
   * @return void
   **/
  $scope.setViewInline=function() {
    $scope.view="inline";
    $scope.togglePanel("tickets",true);
    $scope.togglePanel("ticket",false);
    $('table.tickets_area').addClass('view_inline');
  }

  
  //set the view
  $scope.view="";
  $scope.setViewVertical();
})

// ----------------------------------------------------------------
// ----------------------------------------------------------------
//filter
/**
 * clear whitespace, can remove and replace with string if provided
 * @param {string} [replaceWith] the string to replace whitespace with
 **/
.filter('clear',function(){
  return function(input,replaceWith){
    if(!replaceWith) replaceWith="";

    input.replace('\s',replaceWith);
  }
})

// ----------------------------------------------------------------
// ----------------------------------------------------------------
.factory('serviceStatus',function($timeout){
  var data={
     "status_acknowledged":"acknowledged"
    ,"status_assigned":"assigned"
    ,"status_closed":"closed"
    ,"status_development":"development"
    ,"status_done":"done"
    ,"status_duplicate":"duplicate"
    ,"status_fail":"fail"
    ,"status_ignore":"ignore"
    ,"status_monitor":"monitor"
    ,"status_new":"new"
    ,"status_passed":"passed"
    ,"status_pending_closure":"pending closure"
    ,"status_pending_data":"pending data"
    ,"status_pending_feedback":"pending feedback"
    ,"status_pending_review":"pending review"
    ,"status_reference":"reference"
    ,"status_research":"research"
    ,"status_schedule_release":"schedule release"
    ,"status_test":"test"
  };

  return {
    /**
     * get status
     * @param {string} [id] the status ID
     * @return mix - object if id is empty else string
     **/
    getStatus:function(id) {
      console.log("serviceStatus.getStatus()");
      return new Promise(function(resolve,reject){
        $timeout(function(){
            if(!id) resolve(data);
            else if(!data[id]) resolve("");
            else resolve(data[id]);
        },2000);
      });
    }
  };
})

// ----------------------------------------------------------------
// ----------------------------------------------------------------
.factory('serviceGrouping',function(serviceStatus) {
  function getSpanGrouping(data){
    var groups={};
    groups={
       "today":{label:"today",indices:[]}
      ,"yesterday":{label: "yesterday", indices:[]}
      ,"week":{label: "week", indices:[]}
      ,"two_weeks":{label: "two weeks", indices:[]}
      ,"month":{label: "month", indices:[]}
      ,"two_months":{label: "two months", indices:[]}
      ,"six_months":{label: "six months", indices:[]}
      ,"year":{label: "year", indices:[]}
      ,"over_a_year":{label: "over a year", indices:[]}
    };

    var _getSpan=function(date) {
      // The number of milliseconds in one day
      var ONE_DAY = 1000 * 60 * 60 * 24
      // Convert both dates to milliseconds
      var date1_ms = new Date()
      var date2_ms = new Date(date)
      // Calculate the difference in milliseconds
      var difference_ms = Math.abs(date1_ms.getTime() - date2_ms.getTime())
      // Convert back to days and return
      var days=Math.round(difference_ms/ONE_DAY)
      if (days==0) return "today"
      if (days==1) return "yesterday"
      if (days<=7) return "week"
      if (days<=14) return "two_weeks"
      if (days<=30) return "month"
      if (days<=60) return "two_months"
      if (days<=180) return "six_months"
      if (days<=365) return "year"
      return "over_a_year"
    }

    for(var i=0; i<data.length; i++) {
      var key=_getSpan(data[i].date);

      if (typeof groups[key] === "undefined"){
        key="unknown";
        groups[key]={"label":"uknown",indices:[]}
      }

      groups[key].indices.push(i);
    }

    return groups;
  }

  function getStatusGrouping(data){
    var groups={};

    return serviceStatus.getStatus()
    .then(function(status){
      // create the menu from status
      for (var key in status)
        groups[key]={label:status[key] ,indices:[]};
      
      for(var i=0; i<data.length; i++) {
        var key=data[i].status;
  
        if (typeof groups[key] === "undefined"){
          console.log('unknown key "%s"',key);
          key="unknown";
          groups[key]={"label":"Unknown",indices:[]}
        }
  
        groups[key].indices.push(i);
      }
  
      return groups;
    });
  }

  function getClientGrouping(data){
    var groups={};

    for(var i=0; i<data.length; i++) {
      var label=data[i].client;
      var key=label.replace(' ','_');

      if(!groups[key])
        groups[key]={"label":label,"indices":[]};

      groups[key].indices.push(i);
    }

    return groups;
  }


  return {
    /**
     * get the grouping in respect to data
     * @param {string} group the grouping 
     * @param {object} [data] the data to display
     * @return object an object of labels and menu
     **/
    getGrouping:function(group, data) {
      return new Promise(function(resolve,reject){
      
        // determine the grouping
        if (group=="span")
            return resolve(getSpanGrouping(data));
        if (group=="status") {
          return getStatusGrouping(data)
          .then(function(group){
            resolve(group);
          });
        }
        if (group=="reporter") return;
        if (group=="client") 
          return resolve(getClientGrouping(data));

        reject(new Error("unknown group '"+group+"'"))

      });
      
    }
  }
})

// ----------------------------------------------------------------
// ----------------------------------------------------------------
.factory('serviceTickets',function($filter,$timeout){
  /**
   * get the date from so many days ago
   * @param {int} [days] the number of days
   * @return {string} the date in MM/dd/yyyy format
   **/
  function getDaysAgo(days) {
    var date=new Date();
    if (!days) days=0; 
    date.setDate(date.getDate() - days);
    return $filter('date')(date,'MM/dd/yyyy')
  }

  var data={
    "00001980":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_new"
      ,"date":getDaysAgo(5)
      ,"reporter":"John Doe"
      ,"client":"Client of Ipsum"
    }
    ,"12300678":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_new"
      ,"date":getDaysAgo()
      ,"reporter":"John Doe"
      ,"client":"Client of Ipsum"
    }
    ,"12102678":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_new"
      ,"date":getDaysAgo()
      ,"reporter":"John Doe"
      ,"client":"Client of Ipsum"
    }
    ,"00012322":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_new"
      ,"date":getDaysAgo(30)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012223":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_passed"
      ,"date":getDaysAgo(30)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012378":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_closed"
      ,"date":getDaysAgo(60)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012224":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_closed"
      ,"date":getDaysAgo(360)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012326":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_schedule_release"
      ,"date":getDaysAgo(360)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012225":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_test"
      ,"date":getDaysAgo(10)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012327":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_test"
      ,"date":getDaysAgo(10)
      ,"reporter":"John Doe"
      ,"client":"Jimmy's Big Company"
    }
    ,"00012228":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_schedule_release"
      ,"date":getDaysAgo(190)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
    ,"00012329":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_fail"
      ,"date":getDaysAgo(290)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
    ,"00012429":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_fail"
      ,"date":getDaysAgo(290)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
    ,"00012529":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_fail"
      ,"date":getDaysAgo(290)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
    ,"00012629":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_pending_review"
      ,"date":getDaysAgo(290)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
    ,"00022629":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_pending_data"
      ,"date":getDaysAgo(290)
      ,"reporter":"John Doe"
      ,"client":"Bank Full of Money"
    }
    ,"00012230":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_pending_data"
      ,"date":getDaysAgo(390)
      ,"reporter":"John Doe"
      ,"client":"Bank Full of Money"
    }
    ,"00012231":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_pending_feedback"
      ,"date":getDaysAgo(490)
      ,"reporter":"John Doe"
      ,"client":"Bank Full of Money"
    }
    ,"00012232":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_pending_feedback"
      ,"date":getDaysAgo(98)
      ,"reporter":"John Doe"
      ,"client":"Bank Full of Money"
    }
    ,"00012233":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_acknowledged"
      ,"date":getDaysAgo(90)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
    ,"00012234":
    {
       "title":"Lorem ipsum"
      ,"summary":"Lorem ipsum dolor sit amet, pri in quis detraxit imperdiet. Mucius impetus noluisse vel an, id sed corpora maiestatis. Dicat euismod no mel, te possim elaboraret vis, nobis perfecto aliquando nam in. Eum te quas errem. Ne munere postulant mei. Brute detracto contentiones cu eos."
      ,"status":"status_assigned"
      ,"date":getDaysAgo(90)
      ,"reporter":"John Doe"
      ,"client":"Client of Lorem"
    }
  };

  return {
    getTickets:function(userId) {
      return new Promise(function(resolve,reject) {
        $timeout(function(){
            var _data=[];

            for (var ticket in data) {
              var _ticket=data[ticket];
              _ticket["number"]=ticket;
              _data.push(_ticket);
            }

            resolve(_data);
        },2000);
      });
    }
    ,getBookmarks:function(userId) {
      return [];
    }
    ,getTicketById:function(id){
      if(!data[id]) return false;
      return data[id];
    }
  };
})

// ----------------------------------------------------------------
// ----------------------------------------------------------------
.factory('serviceTicket',function(serviceTickets,$filter,$timeout){
  var data={
     id:""
    ,status:"status_closed"
    ,handlerId:"Smitty Joe"
    ,reporterId:"John Smith"
    ,dateCreated:"05/01/2010 3:00 PM"
    ,client:"Lorem Ipsum Client"
    ,related:[]
    ,severity:"High"
    ,view:"Public"
    ,totalHours:"150.2"
    ,summary:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit. In consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis. Pellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus.\n\nNullam quam urna, bibendum quis augue eu, finibus tincidunt lectus. Etiam eget auctor ex. Etiam quis tellus pulvinar, iaculis mi sit amet, commodo ex. Vivamus sed felis nibh. Sed eu enim suscipit, euismod felis vel, maximus arcu. Cras vitae dolor in erat sagittis ullamcorper. Phasellus vel leo eu sapien dictum lobortis.\n\nDonec tempus pulvinar ipsum, posuere rutrum eros iaculis ut. Ut gravida convallis lacus quis vulputate. Nulla facilisi. Duis fermentum diam nunc, vel elementum dolor efficitur nec. Donec quis varius orci. Curabitur ac viverra purus. Duis hendrerit iaculis diam a commodo. Nam sodales, tellus et scelerisque rutrum, felis turpis pellentesque ligula, quis varius eros felis vel augue. Mauris tincidunt odio sed nisi dictum pharetra. Phasellus dapibus lectus nisi, ac posuere quam faucibus quis."
    ,bugnotes:[
    {
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/16/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_closed"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/15/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_schedule_release"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/14/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"reassigned"
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/13/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_passed"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/13/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/12/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_test"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/12/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/11/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_acknowledged"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/10/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"reassigned"
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/09/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_fail"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/08/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/07/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_test"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/06/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/05/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/04/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_pending_feedback"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/04/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/03/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_acknowledged"
      ,"note":""
    }
    ,{
       "user":"Jimmy Johnson"
      ,"date":{
         "created":"05/02/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":""
      ,"note":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel mauris vehicula, laoreet tellus id, sollicitudin enim. Vestibulum tempus, magna sit amet mollis luctus, augue sapien tempus lorem, eu pharetra massa lectus id erat. Morbi at porttitor velit, ac feugiat neque. Pellentesque consectetur bibendum libero convallis hendrerit.\n\nIn consectetur fermentum leo vel venenatis. Aenean ut vulputate magna. Nunc eleifend vestibulum commodo. Duis vel turpis nulla. Aliquam erat volutpat. Ut ornare congue enim quis commodo. Quisque vitae magna nec est dictum hendrerit ac non turpis.\n\nPellentesque vitae interdum sem. Ut ornare eros finibus ligula venenatis, dapibus vestibulum nisi ornare. Nulla convallis nisi vel dui malesuada aliquam. Donec viverra ex eu arcu efficitur imperdiet. Vivamus vulputate ex vel libero elementum finibus."
    }
    ,{
       "user":"John Smith"
      ,"date":{
         "created":"05/01/2010 3:00 PM"
        ,"updated":"07/01/2014 4:38 PM"
      }
      ,"view":"public"
      ,"hours":"4.3"
      ,"status":"status_new"
      ,"note":"created ticket"
    }
  ]};

  return {
    getTicket:function(ticketId) {
      return new Promise(function(resolve,reject){
        $timeout(function(){
          var _ticket=serviceTickets.getTicketById(ticketId);
          data["id"]=ticketId;

          if(_ticket) {
            data["status"]=_ticket["status"];
            data["client"]=_ticket["client"];
            data["reporterId"]=_ticket["reporter"];
          }

          console.log(data);
          resolve(data);
        },2000);
      });
    }
  };
});