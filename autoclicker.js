// funny little script
var interval = -1
var golden = -1
var hovering = false

var bigCookie = document.getElementById("bigCookie")
bigCookie.addEventListener("mouseover", () => {
    hovering = true
})

bigCookie.addEventListener("mouseout", () => {
    hovering = false
})

onblur = () => hovering = false

function auto() {
    interval = setInterval(() => {
        if (hovering) {
            Game.ClickCookie()
        }
    }, 5)
}

function gold() {
    golden = setInterval(() => {
        var t = Game.shimmers[0]
        if (t != null) {
            t.pop()
        }
    }, 125) // yeah thanks Uncanny Clicker for ruining so many people's saves this works fine
}
onkeydown = e => {
    if (e.key === "1") {
        if (interval === -1) {
            Game.Notify(choose(['Autoclicking enabled.']), '', 0, 2)
            auto()
        } else {
            Game.Notify(choose(['Autoclicking disabled.']), '', 0, 2)
            clearInterval(interval)
            interval = -1
        }
    } else if (e.key === "2") {
        if (golden === -1) {
            if (Game.season == "christmas") {
                Game.Notify(choose(['Autoclicking of golden cookies and reindeer enabled.']), '', 0, 2)
            } else {
                Game.Notify(choose(['Autoclicking of golden cookies enabled.']), '', 0, 2)
            }
            gold()
        } else {
            if (Game.season == "christmas") {
                Game.Notify(choose(['Autoclicking of golden cookies and reindeer disabled.']), '', 0, 2)
            } else {
                Game.Notify(choose(['Autoclicking of golden cookies disabled.']), '', 0, 2)
            }
            clearInterval(golden)
            golden = -1
        }
    }
}

if (!localStorage.getItem("CookieClickerAC")) {
    Game.Prompt('Press 1 to autoclick the big cookie and 2 to autoclick golden cookies. They can be toggled.', [loc("Okay!")])
    localStorage.setItem("CookieClickerAC", 1)
}