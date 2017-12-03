export class SecretSantaCircle {
    users = []
    matches = null

    getChildOf(user) {
        if (this.matches) {
            return this.matches[user.id]
        } else {
            return null
        }
    }

    add(user) {
        if (!this.users.find(u => u.id === user.id)) {
            this.users.push(user)
        }
    }

    matchChildren() {
        this.matches = this.match(this.users)
    }

    match(toMatch) {
        const matches = {}
        toMatch = this.shuffle(toMatch)
        toMatch.forEach((user, index) => matches[user.id] = toMatch[(index + 1) % toMatch.length])
        return matches
    }

    shuffle<T>(array: Array<T>): Array<T> {
        // Code from https://stackoverflow.com/a/2450976/3287963
        let currentIndex = array.length, temporaryValue, randomIndex

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex -= 1

            temporaryValue = array[currentIndex]
            array[currentIndex] = array[randomIndex]
            array[randomIndex] = temporaryValue
        }

        return array
    }
}
