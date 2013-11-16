class window.ApeBossEnemyAI extends EnemyAI

  states:
    SEEKING: 0
    PURSUING: 1
    SHOOTING: 2
    PUSHING: 3
    JUMPING_ON: 4
    HALT: 5
    
  attackCycle: [2, 3, 4]

  haltStateDuration: 0
  haltMaxDuration: 0
  attackDistance: 80
  pushDir: 0
  patrolDir: 0
  jumpDir: 0
  velocity: 0

  constructor: (obj, target, level) -> super obj, target, level

  init: ->
    super
    @velocity = @obj.platform.maxspeed

  setState: (@state) ->
    @haltStateDuration = 0
    #console.log @state
    switch @state
      when @states.PUSHING
        @actionTimeout = 2*Math.random()
        @pushDir = if @obj.x > @target.x then -1 else 1
      when @states.JUMPING_ON
        @actionTimeout = 2*Math.random()
        @jumpDir = if @obj.x > @target.x then -1 else if @obj.x < @target.x then 1 else 0
      when @states.SHOOTING
        @setState(@states.HALT) unless @inShootRange()
    super

  inShootRange: ->
    #console.log "#{@weapon.y} to #{@target.bbox.top},#{@target.bbox.bottom}"
    @weapon.y > @target.bbox.top and @weapon.y < @target.bbox.bottom

  update: (dt) ->
    super dt
    #console.log @haltMaxDuration
    @haltStateDuration += dt
    hasLOStoTarget = @target and @obj.lineOfSight and (@obj.lineOfSight.hasLOSto(@target.x, @target.bbox.bottom) or @obj.lineOfSight.hasLOSto(@target.x, @target.bbox.top))
    @obj.platform.behavior.acts.SetMaxSpeed.call(@obj.platform, if @state is @states.SEEKING then @velocity/2 else @velocity)

    if @state isnt @states.PURSUING and @state isnt @states.SEEKING and
        (@obj.x > @target.x + @attackDistance or @obj.x < @target.x - @attackDistance)
      @setState @states.PURSUING

    if @state isnt @states.SEEKING and not hasLOStoTarget
      @setState @states.SEEKING

    switch @state
      when @states.SEEKING
        if @actionTimeout > 0
          @obj.platform.simleft = @patrolDir < 0
          @obj.platform.simright = @patrolDir > 0
        else
          @actionTimeout = 2*Math.random()
          @patrolDir =  Math.round(2*Math.random())-1
        if @target and hasLOStoTarget
          @setState @states.PURSUING

      when @states.PURSUING
        isByWall = @obj.platform.behavior.cnds.IsByWall
        @obj.platform.simjump or= isByWall.call(@obj.platform, 0) or isByWall.call(@obj.platform, 1);
        @obj.platform.simleft = @obj.x > @target.x + @attackDistance
        @obj.platform.simright = @obj.x < @target.x - @attackDistance
        if @obj.x >= @target.x - @attackDistance and @obj.x <= @target.x + @attackDistance
          @setState @states.HALT

      when @states.HALT
        if @haltStateDuration > @haltMaxDuration
          @lastAttackState = @nextAttackState()
          @setState @lastAttackState
          @haltMaxDuration = Math.random()*(EnemyAI.levels.IMPOSSIBLE - Math.min(EnemyAI.levels.IMPOSSIBLE, @level + 2 *(1 - @obj.instance_vars[0]/@maxHealth)))


      when @states.PUSHING
        if @actionTimeout > 0
          @obj.platform.simleft = @pushDir < 0
          @obj.platform.simright = @pushDir > 0
        else
          @pushDir = 0
          @setState @states.HALT

      when @states.JUMPING_ON
        if @actionTimeout > 0
          @obj.platform.simleft = @jumpDir < 0
          @obj.platform.simright = @jumpDir > 0
          isJumping = @obj.platform.behavior.cnds.IsJumping
          @obj.platform.simjump = not isJumping.call(@obj.platform)
        else
          @setState @states.HALT
