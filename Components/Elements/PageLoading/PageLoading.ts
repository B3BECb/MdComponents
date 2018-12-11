// @ts-ignore
Builder
	.RegisterHtmlTemplate("Components/Elements/PageLoading/PageLoadingTemplate.html",
		(link) =>
		{
			PageLoading.Link = document.querySelector('#' + link.ReferenceName);

			window.customElements.define('md-page-loading', PageLoading);
		});

class PageLoading
	extends HTMLElement
{
	public static Link: HTMLLinkElement;

	private _container: HTMLElement;

	private _loader: HTMLElement;

	private _percente: HTMLElement;

	public set Value(value: number)
	{
		this._percente.innerText = value.toString();
	}

	public get Value()
	{
		return Number.parseInt(this._percente.innerText);
	}

	constructor()
	{
		super();

		this.InsertTemplate();
	}

	private InsertTemplate()
	{
		let content = PageLoading.Link.import.querySelector<HTMLTemplateElement>('template#main').content;

		let shadow = this.attachShadow({ mode: "open" });

		shadow.appendChild(content.cloneNode(true));

		this._container = this.shadowRoot.querySelector(".loader.container");
		this._loader    = this._container.querySelector(".circle.loader");
		this._percente  = this._container.querySelector(".percent .value");

		this._loader.addEventListener('click', () =>
		{
			if(this._container.classList.contains('error'))
			{
				this.ChangeState(PageLoaderStates.None);

				this.dispatchEvent(new CustomEvent('cancel'));
			}
		});

		this.Value = 0;
	}

	public ChangeState(status: PageLoaderStates)
	{
		switch(status)
		{
			case PageLoaderStates.None:
				this._container.classList.remove("error");
				this._container.classList.add("hidden");
				this.Value = 0;
				break;
			case PageLoaderStates.Loading:
				this._container.classList.remove("error");
				this._container.classList.remove("hidden");
				break;
			case PageLoaderStates.Error:
				this._container.classList.add("error");
				this._container.classList.remove("hidden");
				break;
		}
	}
}

enum PageLoaderStates
{
	None,
	Loading,
	Error,
}