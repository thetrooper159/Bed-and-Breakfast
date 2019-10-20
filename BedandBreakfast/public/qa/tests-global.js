suite('Global Tests', function(){
 test('page has a valid title', function(){
 assert(document.title && document.title.match(/\S/) &&
 document.title.toUpperCase() !== 'TODO');
 });
 test('the background color is blue', function(){
 var body = $(document.body);
 assert(body.css("background-color") === "rgb(135,206,250)")
});
});
