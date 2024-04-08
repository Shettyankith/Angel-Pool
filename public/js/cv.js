const btn=document.getElementById("viewcv");

btn.addEventListener("click",async function(event){
    event.preventDefault();
    const response = await fetch("/view-cv");
    const data = await response.json();
    const url = data.url;
    window.open(url, '_blank');
});