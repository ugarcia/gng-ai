class window.VampireBossEnemyAI extends EnemyAI

  states:
    SHOOTING: 2
    HALT: 5
    SLEEPING: 9
    FLOATING: 10
    SHIELDING: 11
    FLYING: 12

  attackCycle: [2, 2, 2, 11, 12, 12]

  haltStateDuration: 0
  haltMaxDuration: 0

  wakeupDistance: 200
  flyAngle: 0
  flyCenter: null
  flyRadius: 0
  flyOffset: 75
  flySpeed: 0.03
  flyX: 1

  constructor: (obj, target, level) -> super obj, target, level, 0

  init: ->
    super
    @state = @states.SLEEPING
    switch Math.floor(5*Math.random())
      when 0,1 then @wakeupDistance = 99999
      when 2,3 then @obj.instance_vars[1] = 0

  setState: (@state) ->
    @haltStateDuration = 0
    #console.log @state
    switch @state
      when @states.SHOOTING
        @actionTimeout = 1*Math.random()
      when @states.FLOATING
        @actionTimeout = 2*Math.random()
      when @states.SHIELDING
        @actionTimeout = 5*Math.random()
      when @states.FLYING
        @actionTimeout = 2 + Math.random()

        dx = @obj.x - @target.x
        dy = @target.y - @obj.y
        @flyX =  dx/Math.abs(dx)
        alpha = Math.atan(dy/dx)
        alpha += Math.PI unless dx > 0
        d = Math.sqrt(dx*dx+dy*dy)

        m = x: @target.x + d*Math.cos(alpha)/2, y: @target.y - d*Math.sin(alpha)/2
        @flyCenter = x: m.x - @flyX * @flyOffset*Math.sin(alpha), y: m.y - @flyX * @flyOffset*Math.cos(alpha)

        dx = @obj.x - @flyCenter.x
        dy = @flyCenter.y - @obj.y
        @flyAngle = Math.atan(dy/dx)
        @flyAngle += Math.PI unless dx > 0
        @flyRadius = Math.sqrt(dx*dx+dy*dy)
    super

  update: (dt) ->
    #console.log @state
    super dt
    @haltStateDuration += dt
    hasLOStoTarget = @target and @obj.lineOfSight and (@obj.lineOfSight.hasLOSto(@target.x, @target.bbox.bottom) or @obj.lineOfSight.hasLOSto(@target.x, @target.bbox.top))
    switch @state
      when @states.SLEEPING
        if hasLOStoTarget and cr.distanceTo(@obj.x, @obj.y, @target.x, @target.y) < @wakeupDistance and @obj.instance_vars[1] <= 0
          @setState @states.HALT

      when @states.HALT
        if @haltStateDuration > @haltMaxDuration
          @lastAttackState = @nextAttackState()
          #console.log @lastAttackState
          @setState @lastAttackState
          @haltMaxDuration = Math.random()*(EnemyAI.levels.IMPOSSIBLE - Math.min(EnemyAI.levels.IMPOSSIBLE, @level + 2 *(1 - @obj.instance_vars[0]/@maxHealth)))

      when @states.FLYING
        if @actionTimeout > 0
          # movement parabole
          #console.log @flyAngle
          @obj.x = @flyCenter.x + @flyRadius * Math.cos(@flyAngle)
          nextY = @flyCenter.y - @flyRadius * Math.sin(@flyAngle)
          #@obj.y = nextY unless Math.abs(nextY - @target.y) > 150
          if (nextY > @obj.y and nextY - @target.y > 150) or (nextY < @obj.y and @target.y - nextY > 150)
            @setState @states.HALT
          else
            @obj.y = nextY
          @flyAngle -= @flyX * @flySpeed
          #console.log "#{@obj.x}--#{@obj.y}"
          @obj.set_bbox_changed()
        else
          @setState @states.HALT

      when @states.FLOATING
        if @actionTimeout > 0
          # TODO:
        else
          @setState @states.HALT

      when @states.SHIELDING
        if @actionTimeout > 0
          # TODO:
        else
          @setState @states.HALT

      when @states.SHOOTING
        if @actionTimeout > 0
          # TODO:
        else
          @setState @states.HALT
