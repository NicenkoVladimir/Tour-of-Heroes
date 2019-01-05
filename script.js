$(document).ready(function() {
	/* обьявление глобальных переменных */
	var $data = $('#data');
	var $heroesList = $('#heroesList');
	var $heroesData = $(heroesData);
	var $dasboardList = $('#dasboardList');
	var $messageList = $('#messageList');
	var $searchHero = $('#searchHero');
	var $foundHero = $('#foundHero');
	var $newHeroForm = $('#newHeroForm');
	var $newHeroName = $('#newHeroName');
	var $topHeroes = $('#topHeroes');
	
	/* настройка вывода данных */
	$dasboardList.appendTo($data); 
	$heroesList.appendTo($data); 
	showTopHeroes();
	
	/* --------- */
	
	/* обработка глобальных событий */
	$heroesList.on('click','tr',getHero);
	$('body').delegate('#saveHero','click', saveHero);
	$('body').delegate('#removeHero','click', removeHero);
	$('body').delegate('#closeHero','click', closeHero);
	$('body').delegate('#messageList button','click', removeMessage); 	
	$('body').delegate('#clearMessages','click', clearAllMessages);
	$('body').delegate('#updateHero','input', buttonChangeState);
	$('#heroes').on('click', showHeroesList);
	$('#dashboard').on('click', showDashboard);
	$('#addNewHero').on('click', addNewHero);
	$searchHero.on('change', function() {
		$searchHero.val('')
	});
	

	/* -------- виджет autocomplete input -------------*/
	var autocomplete = function() {
		var source = [];
		$heroesData.each(function(key,val) {
			if (val.id !=null) {
				source.push(val.name);
			}
		});
		
		$searchHero.autocomplete( {
			source: source,
			delay:100,
			select: getHero			
		});
	}
	autocomplete(); 
	/* ----------------- */
	
	/* ------- показать список героев -------- */
	function showHeroesList () {
		$heroesList.find('tbody').empty();
		$heroesData.each(function(key,val) {
			if(val.id!=null) {
				$heroesList.find('tbody').append($('<tr><td>'+val.id+'</td><td>'+val.name+'</td></tr>'));
			}
		});
		$heroesList.css('display','block');
		$dasboardList.css('display','none');
		$('#dashboard').prop('disabled',false);
		$(this).prop('disabled',true);
		$('#addNewHero').css('display','inline-block');
	}	
	
	/* ---------показать dashboard -------- */
	function showDashboard () {
		$(this).prop('disabled',true);
		$('#heroes').prop('disabled',false);
		$dasboardList.css('display','block');
		$heroesList.css('display','none');
		$("#addNewHero").css('display','none');
		$newHeroForm.css('display','none');
		$foundHero.empty();
	}
	
	function getHero (event,hero) {
	var heroName =  $(this).find('td:last').html() || $(this).html() ||  hero.item.value ; 
		$heroesData.each(function(index,value) {
			if (value.name==heroName)  {
				$foundHero.html(`
				<div class='form-inline'>
				<h3 class='text-info'><small>Your hero</small></h3>
				<label class='text-primary' data-id='${value.id}'>Id: ${value.id}</label>
				<input style="width:200px" class='form-control' value=${value.name} id='updateHero'>
				<button class='btn btn-default' id='saveHero' disabled>save</button>
				<button class='btn btn-default' id='removeHero'>remove</button>
				<button class='btn btn-default' id='closeHero'>close</button>
					</div>` );
					if (!$('#heroes').prop('disabled')) {
						sendMessage(`${value.name} was founded succesfully `);
					}
				}
		});
	}
	
	function showTopHeroes() {
		$topHeroes.empty();
		$heroesData.each(function(key,val) {
			if (val.id !=null && key<4) {
				$topHeroes.append(`<div class='topHeroes'>
				<div class='text-primary'>Id: ${val.id}</div>
				<hr>
				<div class='bg-info'>
				<button class='btn btn-link'>${val.name}</button></div>
				</div>`);
			}
		
		});
		$('body').delegate('button.btn-link','click', getHero);
	}
	
	
	function sendMessage(message) {
		$messageList.append(`<div class='col-md-4 col-md-offset-4'>${message} : ${timeNow()}  
		&nbsp<button class='close col-md-1'><span>&times</span></button></div>`); 
		if (!$messageList.is(':empty')) {
				$('#clearMessages').css('display','block');
		}
	}
	
	function addNewHero () {
		var newId;
		var newHero;
		$heroesData.each(function(key,value) {
			if (value.id!=null) { 
				newId=value.id+1;
			 } 
		});
		$newHeroForm.find('label').html(`Id: ${newId}`);
		$foundHero.html($newHeroForm.css('display','block')); 
		$newHeroName.on('input', isNameValid);
		$('#addHero').on('click',addHeroToJSON);
		function isNameValid () {
			var $context = $(this);
			var isHero = false;
			$heroesData.each(function(key,value) {
				 if (value.id!=null) {
					if($context.val().toLowerCase()==value.name.toLowerCase()) {
						$('#addHero').prop('disabled',true);
						$foundHero.find('div.alert').remove();
						$foundHero.append(`<div class='alert alert-warning'>
						This name has already used. Please try to think another name for your new hero</div>`);	
						isHero=true;
					}
				 } 
			});
			if (!isHero && $context.val()=='') {
				$foundHero.append(`<div class='alert alert-warning'>
				Please enter the name of your new hero</div>`);
				$('#addHero').prop('disabled',true);
			}
			else if (!isHero) {
				$foundHero.find('div.alert').remove();
				$('#addHero').prop('disabled',false);
				newHero=$context.val();
			} 
		}
		function addHeroToJSON() {
			$newHeroName.val(null);
			$heroesData.push({id:newId,name:newHero});
			sendMessage(`${newHero} with id [${newId}] was created`);
			$('#addHero').prop('disabled',true);
			showHeroesList();
			closeHero ();
			autocomplete(); 
			showTopHeroes();
		}
	}

	function saveHero () {
		var $id = $(this).parent().find('label').attr('data-id');
		var $newName = $(this).parent().find('input').val();
		$heroesData.each(function(index,value) {
			if (value.id==$id) {
				value.name=$newName;
				sendMessage(`${$newName} was saved`);
			}
		});
		showHeroesList();
		closeHero ();
		autocomplete();
		showTopHeroes();
	}
	
	function removeHero () {
		var $id = $(this).parent().find('label').attr('data-id');
		$heroesData.each(function(index,value) {
			if (value.id==$id) {
				sendMessage(`${value.name} was removed`);
				$heroesData[index].id=null;
				$heroesData[index].name=null;
			}
		});
		$('#heroes').prop('disabled',true);
		showHeroesList();
		closeHero ();
		autocomplete();
		showTopHeroes();
	}
	
	function closeHero () {
		$foundHero.empty();
	}
	
	function removeMessage (button) {
		$(this).closest('div').remove();
		if ($messageList.children().length==0) {
			$('#clearMessages').css('display','none'); 
		}
	}
	
	function clearAllMessages() {
		$($messageList).empty();
		if ($messageList.is(':empty')) {
				$('#clearMessages').css('display','none');
			}
	}
	
	function buttonChangeState () {
		var currentHeroName = $('#updateHero').attr('value');
		var newHeroName = $('#updateHero').val();
		if (currentHeroName!=newHeroName && newHeroName!='') {
			$('#saveHero').prop('disabled',false);
		}
		else {
			$('#saveHero').prop('disabled',true);
		}
	}
		
	function timeNow () {
		var date = new Date();
		function addZero(num) {
			if (num<10) return '0'+num;
			else return num;
		}			
		return addZero(date.getHours())+":"+addZero(date.getMinutes())+":"+addZero(date.getSeconds());
	}
	

	
});