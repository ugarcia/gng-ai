class window.EnemyAI

  @levels:
    BASIC: 0
    REAL: 1
    IMPOSSIBLE: 2

  states: null

  state: null
  level: null
  attackCycle: []
  lastAttackState: null
  actionTimeout: 0
  maxHealth: 0

  obj: null
  eye: null
  weapon: null
  target: null

  constructor: (@obj, @target, @level) -> @init()

  getState: -> @state
  setState: (@state) -> @obj.runtime.trigger(@obj.ai.behavior.cnds.OnStateChanged, @obj)

  getObj: -> @obj
  setObj: (@obj) ->

  getTarget: -> @target
  setTarget: (@target) ->

  getLevel: -> @level
  setLevel: (@level) ->

  getAttackDistance: -> @attackDistance
  setAttackDistance: (@attackDistance) ->

  getEye: -> @eye
  setEye: (@eye) -> @obj.lineOfSight = getElementByKeyValue(@eye.behavior_insts, 'type.name', 'LineOfSight');

  getWeapon: -> @weapon
  setWeapon: (@weapon) ->

  init: ->
    @state = @states.SEEKING
    @lastAttackState = @attackCycle[0]
    @maxHealth = @obj.instance_vars[0]
    @setEye(@obj) unless @eye
    @setWeapon(@obj) unless @weapon

  inShootRange: ->

  nextAttackState: ->
    @lastAttackState =  @attackCycle[Math.floor(@attackCycle.length * Math.random())] #replace with or= for sequential attacks
    #console.log "---------------------------------------------------"
    #console.log @attackCycle
    #console.log "Last attack: #{@lastAttackState}"
    #console.log "---------------------------------------------------"
    return @attackCycle[(i+1)%@attackCycle.length] for i in [0..@attackCycle.length-1] when @attackCycle[i] is @lastAttackState

  update: (dt) -> @actionTimeout -= dt
