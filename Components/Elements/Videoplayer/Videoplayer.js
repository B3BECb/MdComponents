Builder
.RegisterHtmlTemplate("Components/Elements/Videoplayer/VideoplayerTemplate.html",
	(link) =>
	{
		Videoplayer.Link = document.querySelector('#' + link.ReferenceName);

		window.customElements.define('video-player', Videoplayer);
	});

class Videoplayer
	extends HTMLElement
{
	constructor()
	{
		super();

		this.InsertTemplate();

		this._configuration = null;

		this._isPlayerStarted = false;
	}

	InsertTemplate()
	{
		var content = Videoplayer.Link.import.querySelector('template#main').content;

		var shadow = this.createShadowRoot();

		shadow.appendChild(content.cloneNode(true));

		this._BindCommands();
	}

	Configure(configuration)
	{
		if(this._configuration)
		{
			throw 'Player already configured';
		}

		var ConfigureTriggers = () =>
		{
			var triggers = this.shadowRoot.querySelector('.playerLayersContainer .video.layer .triggers');

			configuration.Triggers.forEach(
				(trigger) =>
				{
					let triggerNode = Videoplayer.Link.import.querySelector('template#trigger').content.cloneNode(true);
					triggerNode.querySelector('.text').textContent = trigger.TriggerName;
					let button = triggerNode.querySelector('.trigger.button');
					button.dataset.Id = trigger.TriggerId;
					button.addEventListener('click',
						() =>
						{
							this.dispatchEvent(new CustomEvent("triggerActivated",
								{
									detail: trigger,
								}));
						});
					triggers.appendChild(triggerNode);
				},
			);
		};

		var ConfigureSettings = () =>
		{
			let ConfigureName = (name) =>
			{
				let settingsName = this.shadowRoot.querySelector(
					'.playerLayersContainer .settings.layer .header.line .name');
				settingsName.textContent = name;
			};

			let ConfigurePages = (pages) =>
			{
				let settingsPages = this.shadowRoot.querySelector('.playerLayersContainer .settings.layer .pages');
				let settingsList = this.shadowRoot.querySelector('.playerLayersContainer .settings.layer .triggers');

				pages.forEach(
					(page, index) =>
					{
						let id = 'page' + index;
						let settingsPage = document.createElement('div');
						settingsPage.classList.add('page');
						settingsPage.classList.add('hidden');
						settingsPage.dataset.id = id;
						settingsPage.appendChild(page.Node);
						settingsPages.appendChild(settingsPage);

						let link = Videoplayer.Link.import.querySelector('template#link').content.cloneNode(true);
						link.querySelector('.text').textContent = page.Name;
						let trigger = link.querySelector('.link.button.trigger');
						trigger.dataset.id = id;
						trigger.addEventListener('click',
							(args) =>
							{
								let btn = args.currentTarget;
								if(btn.classList.contains('markared'))
								{
									return;
								}

								this.shadowRoot.querySelector(
									'.playerLayersContainer .settings.layer .triggers .trigger.markared')
									.classList.remove('markared');
								this.shadowRoot.querySelector(
									'.playerLayersContainer .settings.layer .pages .page:not(.hidden)')
									.classList.add('hidden');

								btn.classList.add('markared');
								let page = this.shadowRoot.querySelector(
									`.playerLayersContainer .settings.layer .pages .page[data-id='${btn.dataset.id}']`);
								page.classList.remove('hidden');

								this.dispatchEvent(new CustomEvent("settingsPageChanged",
									{
										detail:
											{
												button: btn,
												page:   page,
												pages:  this.shadowRoot.querySelectorAll(
													'.playerLayersContainer .settings.layer .pages .page'),
												player: this,
											},
									}));
							},
						);
						settingsList.appendChild(link);

					},
				);
			};

			ConfigureName(configuration.Layers.SettingsLayer.Name);
			ConfigurePages(configuration.Layers.SettingsLayer.Pages);
		};

		var ConfigurePlayerName = () =>
		{
			var playerNameNode = this.shadowRoot.querySelector(
				'.playerLayersContainer .video.layer .header.line .name');
			playerNameNode.textContent = configuration.Name;
		};

		var ConfigurePlayerSource = () =>
		{
			switch(configuration.PlayerType)
			{
				case 0:
					var playerSourceNode = this.shadowRoot.querySelector(
						'.playerLayersContainer .video.layer .videoContainer');
					let sourceNode = Videoplayer.Link.import.querySelector('template#imagePlayer')
												.content
												.cloneNode(true);
					var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');
					sourceNode.querySelector('img').addEventListener('error',
						(args) =>
						{
							loadingProgress.classList.add('error');
							if(this._isPlayerStarted)
							{
								this.Stop();
							}
						});
					sourceNode.querySelector('img').addEventListener('load',
						(args) =>
						{
							if(loadingProgress.classList.contains('loading'))
							{
								loadingProgress.classList.remove('error');
								loadingProgress.classList.remove('loading');
							}
						});
					playerSourceNode.appendChild(sourceNode);
					break;
			}
		};

		ConfigurePlayerName();
		ConfigurePlayerSource();
		ConfigureTriggers();
		ConfigureSettings();

		this._configuration = configuration;
	}

	Start()
	{
		this.shadowRoot.querySelector('#StartBtn').classList.add('hidden');
		this.shadowRoot.querySelector('#StopBtn').classList.remove('hidden');

		var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');
		loadingProgress.classList.remove('error');
		loadingProgress.classList.add('loading');

		switch(this._configuration.PlayerType)
		{
			case 0:
				var imageNode = this.shadowRoot.querySelector('.sourceNode');
				imageNode.addEventListener('load', this._Reload);
				imageNode.src = `${this._configuration.Source}&temp=${Date.now()}`;
				break;
		}
		this._isPlayerStarted = !this._isPlayerStarted;

		this.dispatchEvent(new CustomEvent("playerStarted",
			{
				detail: this,
			}));
	}

	Stop()
	{
		this.shadowRoot.querySelector('#StopBtn').classList.add('hidden');
		this.shadowRoot.querySelector('#StartBtn').classList.remove('hidden');

		switch(this._configuration.PlayerType)
		{
			case 0:
				var imageNode = this.shadowRoot.querySelector('.sourceNode');
				imageNode.removeEventListener('load', this._Reload);
				imageNode.src = "";
				break;
		}
		this._isPlayerStarted = !this._isPlayerStarted;

		this.dispatchEvent(new CustomEvent("playerStopped",
			{
				detail: this,
			}));
	}

	get IsPlayerStarted()
	{
		return this._isPlayerStarted;
	}

	_BindCommands()
	{
		var BindPlayerCommands = () =>
		{
			var startBtn = this.shadowRoot.querySelector('#StartBtn');
			startBtn.addEventListener('click',
				() =>
				{
					this.Start();
				},
			);

			var stopBtn = this.shadowRoot.querySelector('#StopBtn');
			stopBtn.addEventListener('click',
				() =>
				{
					var loadingProgress = this.shadowRoot.querySelector('.video.layer .controls.line .loadingProgress');
					loadingProgress.classList.remove('error');
					loadingProgress.classList.remove('loading');
					this.Stop();
				},
			);
		};

		var BindExpandCommand = () =>
		{
			let btns = this.shadowRoot.querySelectorAll('.ExpandBtn');

			btns.forEach(
				(btn) =>
				{
					btn.addEventListener('click',
						() =>
						{
							this.classList.add('fullScreen');

							this.dispatchEvent(new CustomEvent("playerExpanded",
								{
									detail: this,
								}));
						},
					);
				});
		};

		var BindCollapseCommand = () =>
		{
			let btns = this.shadowRoot.querySelectorAll('.CollapseBtn');

			btns.forEach(
				(btn) =>
				{
					btn.addEventListener('click',
						() =>
						{
							this.classList.remove('fullScreen');

							this.dispatchEvent(new CustomEvent("playerCollapsed",
								{
									detail: this,
								}));
						},
					);
				});
		};

		var OpenLayer = (layerName) =>
		{
			this.shadowRoot.querySelector('.video.layer').classList.add('hidden');
			this.shadowRoot.querySelector(`.${layerName}.layer`).classList.remove('hidden');

			this.shadowRoot.querySelectorAll(
				`.playerLayersContainer .${layerName}.layer .pages .page:not(.hidden)`)
				.forEach(
					(node) =>
					{
						node.classList.add('hidden');
					});

			this.shadowRoot.querySelectorAll(
				`.playerLayersContainer .${layerName}.layer .triggers .trigger.markared`)
				.forEach(
					(node) =>
					{
						node.classList.remove('markared');
					});

			let firstPage = this.shadowRoot.querySelector(
				`.playerLayersContainer .${layerName}.layer .pages .page:first-child`);

			if(firstPage)
			{
				firstPage.classList
						 .remove('hidden');
			}

			let firstLink = this.shadowRoot.querySelector(
				`.playerLayersContainer .${layerName}.layer .triggers .trigger:first-child`);

			if(firstLink)
			{
				firstLink.classList
						 .add('markared');
			}
		};

		var CloseLayer = (layerName) =>
		{
			this.shadowRoot.querySelector('.video.layer').classList.remove('hidden');
			this.shadowRoot.querySelector(`.${layerName}.layer`).classList.add('hidden');
		};

		var BindSettingsCommands = () =>
		{
			const layerName = 'settings';

			let BindOpenSettings = () =>
			{
				var settingsBtn = this.shadowRoot.querySelector('#SettingsBtn');
				settingsBtn.addEventListener('click',
					() =>
					{
						if(this._isPlayerStarted)
						{
							this.Stop();
						}

						OpenLayer(layerName);

						this.dispatchEvent(new CustomEvent("settingsOpened",
							{
								detail: this,
							}));
					},
				);
			};

			let BindAbortBtn = () =>
			{
				this.shadowRoot.querySelector("#AbortSettingsBtn")
					.addEventListener('click',
						() =>
						{
							CloseLayer(layerName);

							this.Start();
							this.dispatchEvent(new CustomEvent("settingsAborted",
								{
									detail:
										{
											pages:  this.shadowRoot.querySelectorAll(
												'.playerLayersContainer .settings.layer .pages .page'),
											player: this,
										},
								}));
							this.dispatchEvent(new CustomEvent("settingsClosed",
								{
									detail: this,
								}));
						});
			};

			let BindApplyBtn = () =>
			{
				this.shadowRoot.querySelector("#ApplySettingsBtn")
					.addEventListener('click',
						() =>
						{
							CloseLayer(layerName);

							this.Start();
							this.dispatchEvent(new CustomEvent("settingsApplied",
								{
									detail:
										{
											pages:  this.shadowRoot.querySelectorAll(
												'.playerLayersContainer .settings.layer .pages .page'),
											player: this,
										},
								}));
							this.dispatchEvent(new CustomEvent("settingsClosed",
								{
									detail: this,
								}));
						});
			};

			BindOpenSettings();
			BindApplyBtn();
			BindAbortBtn();
		};

		var BindRecognitionCommands = () =>
		{
			const layerName = 'recognition';

			let BindOpenRecognition = () =>
			{
				var recognitionBtn = this.shadowRoot.querySelector('#ManualRecognitionBtn');
				recognitionBtn.addEventListener('click',
					() =>
					{
						if(this._isPlayerStarted)
						{
							//TODO: Сунуть в изображение данные другого изображения

							this.Stop();
						}

						OpenLayer(layerName);

						this.dispatchEvent(new CustomEvent("recognitionOpened",
							{
								detail: this,
							}));
					});
			};

			let BindAbortBtn = () =>
			{
				this.shadowRoot.querySelector("#AbortRecognitionBtn")
					.addEventListener('click',
						() =>
						{
							this.shadowRoot.querySelector("#FrameImg").src = '';
							CloseLayer(layerName);

							this.Start();
							this.dispatchEvent(new CustomEvent("recognitionAborted",
								{
									detail:
										{
											pages:  this.shadowRoot.querySelectorAll(
												`.playerLayersContainer .${layerName}.layer .pages .page`),
											player: this,
										},
								}));
							this.dispatchEvent(new CustomEvent("recognitionClosed",
								{
									detail: this,
								}));
						});
			};

			let BindRecognizeBtn = () =>
			{
				this.shadowRoot.querySelector("#RecognizeBtn")
					.addEventListener('click',
						() =>
						{
							this.shadowRoot.querySelector("#FrameImg").src = '';
							CloseLayer(layerName);

							this.Start();
							this.dispatchEvent(new CustomEvent("recognitionApplied",
								{
									detail:
										{
											pages:  this.shadowRoot.querySelectorAll(
												`.playerLayersContainer .${layerName}.layer .pages .page`),
											imageData: null, //TODO:Получить данные изображения
											player: this,
										},
								}));
							this.dispatchEvent(new CustomEvent("recognitionClosed",
								{
									detail: this,
								}));
						});
			};

			BindOpenRecognition();
			BindRecognizeBtn();
			BindAbortBtn();
		};

		BindExpandCommand();
		BindCollapseCommand();
		BindPlayerCommands();
		BindSettingsCommands();
		BindRecognitionCommands();
	}

	_Reload(args)
	{
		var url = args.target.currentSrc.split('&temp=')[0];
		args.target.src = `${url}&temp=${Date.now()}`;
	}

	static Types()
	{
		return {
			Image: 0,
			Video: 1.,
		};
	}
}

/**
 * Конфигурация видеоплеера
 * Параметры конструктора:
 * source - источник
 * playerType - тип видеоплеера
 * layers - настройки слоёв плеера
 * name - имя плеера
 * triggers - массив триггеров
 */
class VideoplayerConfiguration
{
	//TODO: передавать конфигурацию отображаемых кнопок. Управляющие кнопки по умолчанию не должны быть видны
	constructor(source, playerType, layers, name = "", triggers = [])
	{
		this.Triggers = triggers;
		this.Source = source;
		this.PlayerType = playerType;
		this.Name = name;
		this.Layers = layers;
	}
}

/**
 * Триггер видеоплеера
 * Параметры конструктора:
 * triggerName - отображаемое имя триггера
 * triggerId - идентификатор триггера
 */
class VideoplayerTrigger
{
	constructor(triggerName, triggerId)
	{
		this.TriggerName = triggerName;
		this.TriggerId = triggerId;
	}
}

/**
 * Настройки слоёв плеера
 * Праметры конструктора:
 * settingsLayerPages - страницы слоя настроек
 * recognitionLayerPages - страницы слоя распознавания
 */
class VideoplayerLayers
{
	constructor(settingsLayerPages = null, recognitionLayerPages = null)
	{
		this.SettingsLayer = settingsLayerPages;
		this.RecognitionLayer = recognitionLayerPages;
	}
}

class VideoplayerLayer
{
	constructor(name, pages = [])
	{
		this.Name = name;
		this.Pages = pages;
	}
}

class LayerPage
{
	constructor(name, node)
	{
		this.Name = name;
		this.Node = node;
	}
}