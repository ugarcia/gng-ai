// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.AIBehaviour = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.AIBehaviour.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;

        this.inst.ai = this;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

    var aiMap = {
        WITCH: 0,
        APEBOSS: 1,
        VAMPIREBOSS: 2
    };

	behinstProto.onCreate = function()
	{
		// Load properties
		var aitype = this.properties[0],
            level = this.properties[1];

        switch(aitype) {
            case aiMap.WITCH:
                this.ai = new WitchEnemyAI(this.inst, null, level);
                break;
            case aiMap.APEBOSS:
                this.inst.platform = getElementByKeyValue(this.inst.behavior_insts, 'type.name', 'Platform');
                this.ai = new ApeBossEnemyAI(this.inst, null, level);
                break;
            case aiMap.VAMPIREBOSS:
                this.ai = new VampireBossEnemyAI(this.inst, null, level);
                break;
        }

        //console.log(cr);
        //console.log(this.inst);
		// object is sealed after this call, so make sure any properties you'll ever need are created, e.g.
	};
	
	behinstProto.onDestroy = function ()
	{
		// called when associated object is being destroyed
		// note runtime may keep the object and behavior alive after this call for recycling;
		// release, recycle or reset any references here as necessary
        delete this.ai;
	};
	
	// called when saving the full state of the game
	behinstProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your behavior's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			"ai": this.ai
		};
	};
	
	// called when loading the full state of the game
	behinstProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
		this.ai = o["ai"];
	};

	behinstProto.tick = function ()
	{				
		// called every tick for you to update this.inst as necessary
		// dt is the amount of time passed since the last tick, in case it's a movement
		var dt = this.runtime.getDt(this.inst);

        this.ai.update(dt);
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": this.type.name,
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				{"name": "My property", "value": this.myProperty}
			]
		});
	};
	
	behinstProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.IsInState = function (state)
	{
		return state == this.ai.getState();
	};

    Cnds.prototype.OnStateChanged = function (state)
    {
        return state == this.ai.getState();
    };
	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.ChangeState = function (state)
	{
		this.ai.setState(state);
	};
	
	Acts.prototype.SetTarget = function (target)
	{
		this.ai.setTarget(target.solstack[target.cur_sol].instances[0]);
	};

    Acts.prototype.SetEye = function (eye)
    {
        this.ai.setEye(eye.solstack[eye.cur_sol].instances[0]);
    };

    Acts.prototype.SetWeapon = function (weapon)
    {
        this.ai.setWeapon(weapon.solstack[weapon.cur_sol].instances[0]);
    };

	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_int(1337);				// return our value
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());