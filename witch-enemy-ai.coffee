class window.WitchEnemyAI extends EnemyAI

  states:
    SEEKING: 0
    SHOOTING_FORWARD: 6
    SHOOTING_DOWN: 7
    TURNING: 8

  attackCycle: [6, 7, 8]

  constructor: (obj, target, level) -> super obj, target, level, 0

  update: (dt) ->
    super dt
    switch @state
      when @states.SEEKING
        if @actionTimeout < 0
          @lastAttackState = @nextAttackState()
          @setState @lastAttackState
          @actionTimeout = 3*Math.random();


