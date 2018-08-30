import React, { Component } from 'react'
import Scoreboard from './Scoreboard.jsx'
import Elimessage from './Elimessage.jsx'
import Eliminations from './Eliminations.jsx'

class UI extends Component {

    constructor(props) {
        super(props)
        this.state = {
            players: [],
            attacker: null,
            target: null,
            eliminations: []
        }
    }

    componentDidMount() {
        this.props.socket.on('initUI', (data) => {
            const allPlayers = []
            const parsedData = JSON.parse(data)
            for (let i = 0; i < parsedData.players.length; i++) {
                allPlayers.push(parsedData.players[i])
            }
            this.setState({ players: allPlayers })
        })
        this.props.socket.on('updateUI', (data) => {
            const parsedData = JSON.parse(data)
            const updatedPlayers = this.state.players
            for (let i = 0; i < parsedData.players.length; i++) {
                updatedPlayers.push(parsedData.players[i])
            }
            this.setState({ players: updatedPlayers })
        })
        this.props.socket.on('eliMessage', (data) => {
            const parsedData = BISON.decode(data);
            const attacker = parsedData.players[0]
            const target = parsedData.players[1]
            this.setState({ attacker: attacker, target: target })
            setTimeout(() => {this.setState({ attacker: null, target: null })}, 5000)
        })
        this.props.socket.on("updateScore", (data) => {
            const parsedData = BISON.decode(data)
            const attacker = parsedData.players[0]
            const target = parsedData.players[1]
            const updatedPlayers = this.state.players
            this.state.players.find((player, index) => {
                if (player.id === attacker.id) {
                    updatedPlayers[index].score = parsedData.players[0].score
                    return true
                }
            })

            const newEliminations = this.state.eliminations
            if (newEliminations.length >= 5) {
                newEliminations.shift()
            }
            newEliminations.push({attacker, target})
            this.setState({ players: updatedPlayers, attacker: attacker, target: target, eliminations: newEliminations })
            setTimeout(()=>{ this.setState({ attacker: null, target: null })}, 5000)
        })

        this.props.socket.on("remove", (data) => {
            const parsedData = BISON.decode(data)
            for (let i = 0; i < parsedData.players.length; i++) {
                this.setState({
                    players: this.state.players.filter((player) => {
                        return player.id !== parsedData.players[i]
                    })
                })
            }
        })
    }

    render() {

        return (
        <div id="UI">
        <Scoreboard players={this.state.players}/>
        <Eliminations eliminations={this.state.eliminations}/>
        <Elimessage selfId={this.props.selfId} target={this.state.target} attacker={this.state.attacker} />
        </div>)
    }
}

export default UI