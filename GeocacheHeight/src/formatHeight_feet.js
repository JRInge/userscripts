    function formatHeight(height) {
        var heightElement = document.createElement("span");
        heightElement.id = "jriCacheHeightFt";
        heightElement.innerHTML = (height >= 0) ? " +" : " ";
        heightElement.innerHTML += Math.round(height * 3.28084) + "ft";
        return heightElement;
    }
    
