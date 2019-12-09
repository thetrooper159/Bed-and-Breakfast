$("#theDate").val(getFormattedDate(today()));
$("#theTomorrow").val(getFormattedDate(tomorrow()));

function today() {
    return new Date();
}

function tomorrow() {
    return today().getTime() + 24 * 60 * 60 * 1000;
}

// Get formatted date YYYY-MM-DD
function getFormattedDate(date) {
    return date.getFullYear()
        + "-"
        + ("0" + (date.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + date.getDate()).slice(-2);
}
