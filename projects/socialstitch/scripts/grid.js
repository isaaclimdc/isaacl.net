$(document).ready(function() {
  // var windowWidth = $(window).width();

  // var griditemwidth = windowWidth/8;
  // console.log(griditemwidth);
  
  for (var i = 0; i < 200; i++) {
    var $boxes = $("<div class='griditem'/>");

    $('#grid').append( $boxes ).masonry( 'appended', $boxes );
  }
});

var $container = $('#grid');
$container.imagesLoaded(function(){
  $('#grid').masonry({
    // options
    isAnimated: true,
    isFitWidth: true,
    isResizable: true,
    itemSelector: '.griditem',
    gutterWidth: 5,
    columnWidth: 150
  });
});