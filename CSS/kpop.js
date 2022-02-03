function currentdate(){
  var dt= new Date()
  console.log(dt.toDateString())
  document.getElementById("datep").innerHTML=dt.toDateString()
}