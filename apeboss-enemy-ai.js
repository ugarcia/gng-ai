// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ApeBossEnemyAI = (function(_super) {
    __extends(ApeBossEnemyAI, _super);

    ApeBossEnemyAI.prototype.states = {
      SEEKING: 0,
      PURSUING: 1,
      SHOOTING: 2,
      PUSHING: 3,
      JUMPING_ON: 4,
      HALT: 5
    };

    ApeBossEnemyAI.prototype.attackCycle = [2, 3, 4];

    ApeBossEnemyAI.prototype.haltStateDuration = 0;

    ApeBossEnemyAI.prototype.haltMaxDuration = 0;

    ApeBossEnemyAI.prototype.attackDistance = 80;

    ApeBossEnemyAI.prototype.pushDir = 0;

    ApeBossEnemyAI.prototype.patrolDir = 0;

    ApeBossEnemyAI.prototype.jumpDir = 0;

    ApeBossEnemyAI.prototype.velocity = 0;

    function ApeBossEnemyAI(obj, target, level) {
      ApeBossEnemyAI.__super__.constructor.call(this, obj, target, level);
    }

    ApeBossEnemyAI.prototype.init = function() {
      ApeBossEnemyAI.__super__.init.apply(this, arguments);
      return this.velocity = this.obj.platform.maxspeed;
    };

    ApeBossEnemyAI.prototype.setState = function(state) {
      this.state = state;
      this.haltStateDuration = 0;
      switch (this.state) {
        case this.states.PUSHING:
          this.actionTimeout = 2 * Math.random();
          this.pushDir = this.obj.x > this.target.x ? -1 : 1;
          break;
        case this.states.JUMPING_ON:
          this.actionTimeout = 2 * Math.random();
          this.jumpDir = this.obj.x > this.target.x ? -1 : this.obj.x < this.target.x ? 1 : 0;
          break;
        case this.states.SHOOTING:
          if (!this.inShootRange()) {
            this.setState(this.states.HALT);
          }
      }
      return ApeBossEnemyAI.__super__.setState.apply(this, arguments);
    };

    ApeBossEnemyAI.prototype.inShootRange = function() {
      return this.weapon.y > this.target.bbox.top && this.weapon.y < this.target.bbox.bottom;
    };

    ApeBossEnemyAI.prototype.update = function(dt) {
      var hasLOStoTarget, isByWall, isJumping, _base;
      ApeBossEnemyAI.__super__.update.call(this, dt);
      this.haltStateDuration += dt;
      hasLOStoTarget = this.target && this.obj.lineOfSight && (this.obj.lineOfSight.hasLOSto(this.target.x, this.target.bbox.bottom) || this.obj.lineOfSight.hasLOSto(this.target.x, this.target.bbox.top));
      this.obj.platform.behavior.acts.SetMaxSpeed.call(this.obj.platform, this.state === this.states.SEEKING ? this.velocity / 2 : this.velocity);
      if (this.state !== this.states.PURSUING && this.state !== this.states.SEEKING && (this.obj.x > this.target.x + this.attackDistance || this.obj.x < this.target.x - this.attackDistance)) {
        this.setState(this.states.PURSUING);
      }
      if (this.state !== this.states.SEEKING && !hasLOStoTarget) {
        this.setState(this.states.SEEKING);
      }
      switch (this.state) {
        case this.states.SEEKING:
          if (this.actionTimeout > 0) {
            this.obj.platform.simleft = this.patrolDir < 0;
            this.obj.platform.simright = this.patrolDir > 0;
          } else {
            this.actionTimeout = 2 * Math.random();
            this.patrolDir = Math.round(2 * Math.random()) - 1;
          }
          if (this.target && hasLOStoTarget) {
            return this.setState(this.states.PURSUING);
          }
          break;
        case this.states.PURSUING:
          isByWall = this.obj.platform.behavior.cnds.IsByWall;
          (_base = this.obj.platform).simjump || (_base.simjump = isByWall.call(this.obj.platform, 0) || isByWall.call(this.obj.platform, 1));
          this.obj.platform.simleft = this.obj.x > this.target.x + this.attackDistance;
          this.obj.platform.simright = this.obj.x < this.target.x - this.attackDistance;
          if (this.obj.x >= this.target.x - this.attackDistance && this.obj.x <= this.target.x + this.attackDistance) {
            return this.setState(this.states.HALT);
          }
          break;
        case this.states.HALT:
          if (this.haltStateDuration > this.haltMaxDuration) {
            this.lastAttackState = this.nextAttackState();
            this.setState(this.lastAttackState);
            return this.haltMaxDuration = Math.random() * (EnemyAI.levels.IMPOSSIBLE - Math.min(EnemyAI.levels.IMPOSSIBLE, this.level + 2 * (1 - this.obj.instance_vars[0] / this.maxHealth)));
          }
          break;
        case this.states.PUSHING:
          if (this.actionTimeout > 0) {
            this.obj.platform.simleft = this.pushDir < 0;
            return this.obj.platform.simright = this.pushDir > 0;
          } else {
            this.pushDir = 0;
            return this.setState(this.states.HALT);
          }
          break;
        case this.states.JUMPING_ON:
          if (this.actionTimeout > 0) {
            this.obj.platform.simleft = this.jumpDir < 0;
            this.obj.platform.simright = this.jumpDir > 0;
            isJumping = this.obj.platform.behavior.cnds.IsJumping;
            return this.obj.platform.simjump = !isJumping.call(this.obj.platform);
          } else {
            return this.setState(this.states.HALT);
          }
      }
    };

    return ApeBossEnemyAI;

  })(EnemyAI);

}).call(this);
