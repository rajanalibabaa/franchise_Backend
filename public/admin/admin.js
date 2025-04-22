function handleInvestors() {
    
    investorContainer = true
    console.log(investorContainer)
    if( investorContainer){
        document.getElementById("investorContainer").style.display = "block";
    }
    // You can also fetch new data via AJAX or navigate
    // Example: location.href = '/admin/investors';
  }


  function handleDownloadBTN(id) {
    console.log("Download button clicked for ID:", id);
  }