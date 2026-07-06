# 🗄️ Arena Bolão

# Database Architecture

Versão 2.0

---

# Objetivo

Este documento define toda a arquitetura de dados da Arena Bolão.

O banco foi projetado para ser:

- Escalável
- Modular
- Seguro
- Simples de manter
- Preparado para milhares de usuários simultâneos
- Compatível com futuras temporadas e campeonatos

A Copa do Mundo será apenas a primeira competição suportada.

---

# Tecnologia

Banco de dados:

Firebase Realtime Database

Motivos da escolha:

- Atualização em tempo real
- Excelente integração com Firebase Authentication
- Baixa latência
- Facilidade para sincronização
- Escalabilidade
- Excelente suporte para aplicações mobile

---

# Estrutura Geral

```
users
arenas
memberships
competitions
teams
games
predictions
rankings
achievements
notifications
settings
logs
```

Cada coleção possui uma responsabilidade única.

Isso evita duplicação de dados e facilita futuras evoluções.

---

# Users

Responsável pelos dados globais do usuário.

Cada usuário existe apenas uma vez.

Exemplo:

```json
users
{
  "uid123": {
    "uid": "uid123",
    "name": "Thiago",
    "email": "thiago@email.com",
    "photoURL": "",
    "createdAt": 1710000000000,
    "lastLoginAt": 1710000000000,
    "provider": "google",
    "status": "active"
  }
}
```

Campos:

| Campo | Descrição |
|--------|-----------|
| uid | Identificador único |
| name | Nome do usuário |
| email | Email |
| photoURL | Avatar |
| provider | Google ou Email |
| status | active / blocked |

---

# Arenas

Representa um ambiente independente.

Exemplos:

- Arena Copa 2026
- Empresa XPTO
- Família Silva

Exemplo:

```json
arenas
{
  "arena001": {
    "name": "Arena Copa 2026",
    "slug": "arena-copa-2026",
    "ownerId": "uid123",
    "createdAt": 1710000000000,
    "status": "active",
    "visibility": "private"
  }
}
```

Status possíveis

```
draft
active
inactive
archived
```

---

# Memberships

Relaciona usuários às arenas.

Um usuário pode participar de várias arenas.

```json
memberships
{
  "arena001": {
    "uid123": {
      "role":"owner",
      "displayName":"Thiago",
      "points":52,
      "level":"gold",
      "joinedAt":1710000000000
    }
  }
}
```

Roles

```
owner
admin
moderator
player
guest
```

---

# Competitions

Representa um campeonato.

Exemplos:

- Copa do Mundo
- Libertadores
- Brasileirão

```json
competitions
{
    "competition001":{
        "arenaId":"arena001",
        "name":"Copa do Mundo 2026",
        "status":"running",
        "startsAt":1710000000000,
        "endsAt":1710000000000
    }
}
```

Status

```
draft

scheduled

running

finished

archived
```

---

# Teams

Representa uma seleção ou clube.

```json
teams
{
    "team001":{
        "name":"Brasil",
        "shortName":"BRA",
        "flag":"🇧🇷",
        "color":"#009739"
    }
}
```

---

# Games

Cada partida cadastrada.

```json
games
{
    "game001":{
        "competitionId":"competition001",
        "homeTeam":"team001",
        "awayTeam":"team002",
        "homeScore":null,
        "awayScore":null,
        "winner":null,
        "status":"scheduled",
        "phase":"group",
        "kickoff":1710000000000
    }
}
```

Status possíveis

```
scheduled

locked

live

finished

cancelled
```

---

# Predictions

Todos os palpites.

```json
predictions
{
    "competition001":{
        "game001":{
            "uid123":{
                "homeScore":2,
                "awayScore":1,
                "createdAt":1710000000000,
                "updatedAt":1710000000000,
                "points":0
            }
        }
    }
}
```

Observações

Cada usuário possui apenas um palpite por partida.

Após o bloqueio da partida:

Não será possível editar.

---

# Rankings

Responsável pela classificação.

```json
rankings
{
    "competition001":{
        "uid123":{
            "points":52,
            "position":2,
            "previousPosition":4,
            "exactScores":7,
            "correctResults":18,
            "streak":5
        }
    }
}
```

O ranking será recalculado automaticamente sempre que um resultado oficial for publicado.

---

# Achievements

Sistema de gamificação.

```json
achievements
{
    "uid123":{
        "achievement001":{
            "title":"Em Chamas",
            "description":"Acertou cinco partidas consecutivas",
            "unlockedAt":1710000000000
        }
    }
}
```

Exemplos

- Em Chamas
- Profeta
- Rei do Mata-Mata
- Mestre dos Empates
- Lenda da Arena

---

# Notifications

Mensagens internas.

```json
notifications
{
    "uid123":{
        "notification001":{
            "title":"Você subiu no ranking",
            "message":"Agora você ocupa a segunda posição.",
            "type":"ranking",
            "read":false,
            "createdAt":1710000000000
        }
    }
}
```

Tipos

```
ranking

game

achievement

system

admin
```

---

# Settings

Configurações globais.

```json
settings
{
    "maintenanceMode":false,
    "currentCompetition":"competition001",
    "version":"2.0"
}
```

---

# Logs

Registro de auditoria.

```json
logs
{
    "log001":{
        "uid":"uid123",
        "action":"CREATE_GAME",
        "createdAt":1710000000000
    }
}
```

Todas as ações administrativas importantes deverão ser registradas.

---

# Relacionamento entre entidades

```
User
 │
 ├── Membership
 │
Arena
 │
 ├── Competitions
 │      │
 │      ├── Games
 │      │      │
 │      │      └── Predictions
 │      │
 │      └── Rankings
 │
 ├── Notifications
 │
 └── Achievements
```

---

# Regras de Negócio

## Usuários

- Um e-mail corresponde a apenas um usuário.
- O perfil é único para toda a plataforma.

---

## Palpites

- Apenas um palpite por jogo.
- Não podem ser alterados após o bloqueio.
- Todo histórico deve ser preservado.

---

## Ranking

O ranking será calculado automaticamente.

Critérios:

- Resultado correto
- Placar exato
- Bônus por sequência
- Critérios de desempate

---

## Segurança

Cada usuário poderá:

- visualizar apenas seus dados privados;
- editar apenas seus palpites;
- alterar apenas seu perfil.

Administradores poderão:

- criar campeonatos;
- cadastrar equipes;
- cadastrar partidas;
- lançar resultados;
- gerenciar participantes.

---

# Escalabilidade

A arquitetura foi projetada para suportar:

✅ milhares de usuários

✅ múltiplas arenas

✅ múltiplas temporadas

✅ diferentes campeonatos

✅ futuras modalidades esportivas

sem necessidade de remodelagem do banco.

---

# Filosofia

O banco de dados deve evoluir junto com o produto.

Novas funcionalidades deverão reutilizar a arquitetura existente sempre que possível.

O objetivo é manter simplicidade, desempenho e escalabilidade durante toda a vida da Arena Bolão.
