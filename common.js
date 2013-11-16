// Scripts in this file are included in both the IDE and runtime, so you only
// need to write scripts common to both once.

function getElementByKeyValue(array, key, value) {
	var aKey = key.split(".");
	for (var i=0, j=array.length; i<j; i++) {
		var tmp = array[i];
		for (var k=0, l=aKey.length; k<l; k++) {
			tmp = tmp[aKey[k]];
		}
		if (tmp == value) {
			return array[i];
		}
	}
	return null;
}


	