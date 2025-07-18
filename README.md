
# SilverBullet Doc Manager Plug

A Silverbullet Plug that can generate a list of documents saved in your SilverBullet space allowing you to see in which notes they are used and to delete them.

## Usage

```
${ widget.new { html = system.invokeFunction("docmanager.renderDocManager", nil), display = "block" } }
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

## Installation
If you would like to install this plug straight from Github, make sure you have the `.js` file committed to the repo and simply add

```
"github:user/plugname/plugname.plug.js",
```

to your list of plugs in your `CONFIG` file, run `Plugs: Update` command and off you go!
