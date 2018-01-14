    function formatHeight(height) {
        var heightElement = document.createElement("span");
        heightElement.id = "jriCacheHeight";
        heightElement.innerHTML = (height >= 0) ? " +" : " ";
        heightElement.innerHTML += Math.round(height) + "m";
        return heightElement;
    }

