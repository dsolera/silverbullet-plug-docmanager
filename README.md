
# SilverBullet Document Manager Plug

A Plug that can generate a list of documents saved in your SilverBullet space.

The document list includes:

* Document name, clickable to open the document in a new tab
* Document size
* List of pages that include a link or reference to the document, clickable to open the page(s) at the position the document is referenced
* If the document is not used in any page, a Delete button to delete the document (after confirmation).

This plug also displays the number of documents and their total size.

## Usage

To display the document manager in any page of your space, paste the following Lua Expression.

```lua
${ widget.new { html = system.invokeFunction("docmanager.render"), events = { click = function(e) system.invokeFunction("docmanager.click", e.data.target.getAttribute("data-item")) end }, display = "block" } }
```

You can also specify a Regular Expression to **exclude** some documents from the list. For example, this allows you to exclude files ending with a `.bin` extension:

```lua
${ widget.new { html = system.invokeFunction("docmanager.render", "\\.bin$"), ... same as above ... }
```

## Installation

If you would like to install this plug straight from Github, make sure you have the `.js` file committed to the repo and simply add this URL to the list of plugs in your `CONFIG` file, run `Plugs: Update` command and off you go!

```lua
config.set {
  plugs = {
    ... other plugs ...,
    "github:dsolera/silverbullet-plug-docmanager/docmanager.plug.js"
  }
}
```

## Build

To build this plug, make sure you have [Deno installed](https://docs.deno.com/runtime/). Then, build the plug with:

```shell
deno task build
```

Then, copy the resulting `.plug.js` file into your space's `_plug` folder. Or build and copy in one command:

```shell
deno task build && cp *.plug.js /my/space/_plug/
```

SilverBullet will automatically sync and load the new version of the plug, just watch your browser's JavaScript console to see when this happens.
