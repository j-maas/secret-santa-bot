import { User } from 'telegraf/typings/telegram-types'

export class SecretSantaCircle {
  users: Array<User> = []
  matches = null

  getChildOf (user: User): User {
    if (this.matches) {
      return this.matches[user.id]
    } else {
      return null
    }
  }

  add (user: User) {
    if (!this.users.find(u => u.id === user.id)) {
      this.users.push(user)
    }
  }

  matchChildren () {
    this.matches = this.createMatch(this.users)
  }

  createMatch (toMatch: Array<User>): object {
    const matches = {}
    const shuffled = this.shuffle(toMatch)
    shuffled.forEach((user, index) => matches[user.id] = shuffled[(index + 1) % shuffled.length])
    return matches
  }

  shuffle<T> (array: Array<T>): Array<T> {
        // Code from https://stackoverflow.com/a/2450976/3287963
    let currentIndex = array.length, temporaryValue, randomIndex

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }

    return array
  }
}
