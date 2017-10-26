
// some snippets removed fromthe identity block.

/*for(var key in localStorage){
  if(key.startsWith('bot-')){
    var stored = localStorage.getItem(key).split(',');
    seen[key.substring(4)] = {
      mac:stored[0],
      ts:stored[1],
    };
  }
}*/

/*for(var i in seen){
  if(bots[i] === undefined){
    identityBlock.addItem(i, seen[i].mac, seen[i].ts);
  }
}*/

/*for(var key in seen){
  localStorage.setItem('bot-' + key, seen[key].mac + "," + seen[key].ts);
}*/
