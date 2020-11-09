const my_request = indexedDB.open("transactions", 1);
let my_database;
my_request.onsuccess = function(event){
    my_database = event.target.result;
    if(navigator.onLine){
        sendAllPendingTransactions();
    }
}

my_request.onerror = function(event){
    console.log("Error occured : "+ event.target.errorCode);
}

my_request.onupgradeneeded = function(event){
    my_database = event.target.result;
    my_database.createObjectStore("pending",{autoincrement: true});
}

function saveRecord(my_transaction){
  const t = db.transaction(["pending_transactions"], "readwrite");
  const my_store = t.objectStore("pending_transactions");
  my_store.add(my_transaction);
}

function sendAllPendingTransactions() {
    const t = db.transaction(["pending_transactions"], "readwrite");
    const my_store = t.objectStore("pending_transactions");
    const all_trans = my_store.getAll();
  
    all_trans.onsuccess = function() {
      if (all_trans.result.length != 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(all_trans.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          const t = db.transaction(["pending"], "readwrite");
          const my_store = t.objectStore("pending");
          my_store.clear();
        });
      }
    };
  }
  
  window.addEventListener("online", sendAllPendingTransactions);