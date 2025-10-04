'use client';
import { FsmViewWrapper } from './view-wrapper';
import { useState, useRef, useEffect, useCallback } from 'react';

const virtualFS = {
    '~': {
        'README.md': 'Welcome to Superlab Quantum! This is a privileged, browser-based, polyglot IDE. Type `help` for commands.',
        'docs': {
            'linux_privilege_escalation.html': `... (Content from your sudo document) ...`,
            'android_security_overview.html': `... (Content from your Android security document) ...`
        },
        'build_scripts': {
            'APKBUILD': `# WebLabs-MobIDE - Mobile-First Quantum WebIDE with AI Development
pkgname=weblabs-mobide
pkgver=2.1.0
pkgrel=1
pkgdesc="Mobile-First Quantum WebIDE with AI-Assisted Development and ARM64 Android Support"
url="https://github.com/spiralgang/WebLabs-MobIDE"
arch="aarch64"
license="MIT"
makedepends="bash nodejs npm docker android-tools"
source="https://github.com/spiralgang/WebLabs-MobIDE/archive/v$pkgver.tar.gz"

build() {
    cd "$builddir"
    echo "Building WebLabs-MobIDE Docker Ubuntu Environment..."
    npm install
    npm run build
    ./gradlew assembleRelease
}

package() {
    cd "$builddir"
    mkdir -p "$pkgdir"/usr/bin
    mkdir -p "$pkgdir"/opt/weblabs-mobide
    cp -r app/build/outputs/apk/release/*.apk "$pkgdir"/opt/weblabs-mobide/
    cp -r docs/* "$pkgdir"/opt/weblabs-mobide/webide/
    echo "#!/bin/sh" > "$pkgdir"/usr/bin/weblabs-mobide
    echo "cd /opt/weblabs-mobide && node server.js" >> "$pkgdir"/usr/bin/weblabs-mobide
    chmod +x "$pkgdir"/usr/bin/weblabs-mobide
}`,
            'abuild-keygen.in': `#!/bin/sh
# Simulates key generation for package signing.

SUDO="$\{SUDO-sudo}"
msg() { echo "==> $1"; }

get_privkey_file() {
    privkey="$HOME/.abuild/user-key.rsa"
    msg "Generating public/private rsa key pair."
    echo "Saving key to [$privkey]"
}

do_keygen() {
    get_privkey_file
    pubkey="$privkey.pub"
    msg "Key generation complete."
    msg "Please remember to make a safe backup of your private key: $privkey"
}

do_keygen`,
            'bootchartd': `#!/bin/sh
# Simulates bootchart data collection.

PATH="/sbin:/bin"
finalize() {
    echo "version = 1.0"
    echo "title = Boot chart for Superlab"
    echo "system.uname = Linux 6.8.0-superlab"
    echo "system.cpu = Emulated ARMv9 (8 cores)"
    echo "system.kernel.options = console=ttyS0"
    tar -zcf /var/log/bootchart.tgz header proc_stat.log proc_diskstats.log
}

case "$1" in
start-initfs)
    echo "Starting boot logging..."
    sleep 2 # Simulate logging
    echo "Finalizing boot chart..."
    finalize
    echo "Boot chart saved to /var/log/bootchart.tgz"
    ;;
*)
    echo "Usage: bootchartd start-initfs"
    ;;
esac`
        },
        'projects': {
            'ai_dev_system': {
                'ai_dev_system.py': `#!/usr/bin/env python3
import asyncio
import json
import logging

class UnstoppableExecutor:
    def execute(self, command):
        logging.info(f"Executing: {command}")
        return {"success": True, "output": f"Simulated output of {command}"}

class AIOrchestrator:
    def __init__(self):
        self.models = ['phi', 'qwen', 'deepseek']
    
    async def consensus_query(self, prompt):
        logging.info(f"Querying AI models with: {prompt}")
        return {model: f"AI response from {model} for '{prompt}'" for model in self.models}

async def main():
    logging.basicConfig(level=logging.INFO)
    ai = AIOrchestrator()
    print("AI Dev System Initialized in Python.")
    responses = await ai.consensus_query("Analyze project structure")
    print(json.dumps(responses, indent=2))

if __name__ == "__main__":
    asyncio.run(main())`
            },
            'android_native_app': {
                'build.gradle': `apply plugin: 'com.android.application'\nandroid {\n    externalNativeBuild {\n        cmake {\n            path "src/main/cpp/CMakeLists.txt"\n        }\n    }\n}`,
                'src/main/cpp/CMakeLists.txt': `project("native-lib")\nadd_library(native-lib SHARED main.cpp)\ntarget_link_libraries(native-lib log)`,
                'src/main/cpp/main.cpp': `#include <jni.h>\n\nextern "C" JNIEXPORT jstring JNICALL\nJava_com_example_app_MainActivity_stringFromJNI(JNIEnv* env, jobject) {\n    return env->NewStringUTF("Hello from JNI");\n}`
            }
        },
        'licenses': {
            'dotnet_ThirdPartyNotices.txt': `.NET Runtime uses third-party libraries or other resources...\nLicense notice for ASP.NET: Apache License, Version 2.0.\nLicense notice for Zlib: zlib License.\nLicense notice for musl: MIT license.`
        },
        'security_tools.json': `{
"timestamp": "2025-09-07T09:28:42.191712",
"su_binaries": {
"description": "Superuser binary implementations",
"implementations": [
  { "name": "Magisk SU", "description": "Modern Android superuser solution" }
]
},
"privilege_escalation": {
"description": "Privilege escalation methods",
"methods": [
  { "name": "su command", "description": "Switch user to root" },
  { "name": "sudo", "description": "Execute commands as another user" }
]
}
}`
    }
};

const helpText = `<b>Superlab Quantum Commands:</b>
<span class="text-green-400">ls, cd, cat, pwd, mkdir, touch, echo</span> - File system
<span class="text-cyan-400">python &lt;file.py&gt;</span> - (Simulated) Execute Python via WebAssembly
<span class="text-yellow-400">git clone/status/log</span> - (Simulated) Git client
<span class="text-purple-400">analyze, generate, refactor</span> - (Simulated) AI development tools
<span class="text-orange-400">abuild, bootchartd, build:android</span> - (Simulated) Build tools
<span class="text-blue-400">browse &lt;url&gt;, clear</span> - Utilities`;

export function IDEMatrix() {
    const [output, setOutput] = useState<string[]>(['Welcome to the IDE Matrix! This is a simulated, browser-based, polyglot IDE. Type `help` for commands.']);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentPath, setCurrentPath] = useState<string[]>(['~']);
    const [isBusy, setIsBusy] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const browserRef = useRef<HTMLIFrameElement>(null);
    const browserInputRef = useRef<HTMLInputElement>(null);
    const [fs, setFs] = useState(virtualFS);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const writeToTerminal = useCallback((text: string) => {
        setOutput(prev => [...prev, text]);
    }, []);

    const resolvePath = useCallback((pathStr: string, base: string[] = currentPath) => {
        let newPath;
        if (pathStr.startsWith('/')) {
            newPath = ['~'];
            pathStr = pathStr.substring(1);
        } else if (pathStr.startsWith('~/')) {
            newPath = ['~'];
            pathStr = pathStr.substring(2);
        } else {
            newPath = [...base];
        }

        const parts = pathStr.split('/').filter(p => p.length > 0);

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (newPath.length > 1) newPath.pop();
            } else {
                newPath.push(part);
            }
        }
        return newPath.filter(p => p);
    }, [currentPath]);

    const navigateTo = useCallback((pathParts: string[]) => {
        let current: any = fs;
        for (const part of pathParts) {
            if (current && typeof current === 'object' && current[part] !== undefined) {
                current = current[part];
            } else {
                return null;
            }
        }
        return current;
    }, [fs]);
    
    const createOrUpdate = useCallback((pathParts: string[], content: any, isDir = false) => {
        setFs(prevFs => {
            const newFs = JSON.parse(JSON.stringify(prevFs)); // Deep copy
            let current: any = newFs;
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
            const finalPart = pathParts[pathParts.length - 1];
            if (isDir) {
                current[finalPart] = current[finalPart] || {};
            } else {
                current[finalPart] = content;
            }
            return newFs;
        });
    }, []);


    const processCommand = useCallback(async (command: string) => {
        if (isBusy) return;
        setIsBusy(true);

        const pathString = currentPath.join('/') || '/';
        const promptHTML = `<span class="text-teal-400">user@superlab</span>:<span class="text-violet-400">${pathString}</span><span class="text-stone-300">$</span>`;
        writeToTerminal(`${promptHTML} ${command}`);
        
        setHistory(prev => [command, ...prev]);
        setHistoryIndex(-1);

        const parts = command.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map(p => p.replace(/^["']|["']$/g, '')) || [];
        const cmd = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        try {
            switch (cmd) {
                case 'help':
                    writeToTerminal(helpText);
                    break;
                case 'ls': {
                    const targetDir = navigateTo(currentPath);
                    if (targetDir && typeof targetDir === 'object') {
                        const contents = Object.keys(targetDir).map(key =>
                            (typeof targetDir[key] === 'object') ? `<span class="text-blue-400 font-bold">${key}/</span>` : key
                        ).join('&nbsp;&nbsp;&nbsp;');
                        writeToTerminal(contents || '(empty)');
                    } else {
                        writeToTerminal('ls: cannot access directory.');
                    }
                    break;
                }
                case 'cd': {
                    if (!args[0] || args[0] === '~') {
                        setCurrentPath(['~']);
                    } else {
                        const newPathParts = resolvePath(args[0]);
                        if (navigateTo(newPathParts) !== null && typeof navigateTo(newPathParts) === 'object') {
                            setCurrentPath(newPathParts);
                        } else {
                            writeToTerminal(`cd: ${args[0]}: No such file or directory`);
                        }
                    }
                    break;
                }
                 case 'cat': {
                    const fileContent = navigateTo(resolvePath(args[0]));
                    if (typeof fileContent === 'string') {
                         writeToTerminal(fileContent.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                    } else {
                         writeToTerminal(`cat: ${args[0]}: Not a file or not found`);
                    }
                    break;
                }
                case 'pwd':
                    writeToTerminal(currentPath.join('/'));
                    break;
                case 'mkdir':
                    if (args[0]) createOrUpdate(resolvePath(args[0]), {}, true);
                    break;
                case 'touch':
                    if (args[0]) createOrUpdate(resolvePath(args[0]), '');
                    break;
                 case 'echo': {
                    const output = args.join(' ');
                    // Primitive redirection
                    if (output.includes('>')) {
                        const [content, file] = output.split('>').map(s => s.trim());
                        if (file) {
                             createOrUpdate(resolvePath(file), content);
                             writeToTerminal(`Wrote to ${file}`);
                        } else {
                            writeToTerminal(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                        }
                    } else {
                        writeToTerminal(output.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                    }
                    break;
                }
                case 'clear':
                    setOutput([]);
                    break;
                case 'browse':
                     if (browserRef.current && args[0]) {
                        let formattedUrl = args[0].trim();
                        if (!/^(https?:\/\/)/i.test(formattedUrl) && formattedUrl.includes('.')) formattedUrl = `https://${formattedUrl}`;
                        else if (!/^(https?:\/\/)/i.test(formattedUrl)) formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedUrl)}`;
                        browserRef.current.src = formattedUrl;
                        if(browserInputRef.current) browserInputRef.current.value = formattedUrl;
                     }
                     break;
                 case 'python':
                 case 'git':
                 case 'analyze':
                 case 'generate':
                 case 'refactor':
                 case 'abuild':
                 case 'bootchartd':
                 case 'build:android':
                    writeToTerminal(`Simulating command: <span class="text-yellow-400">${cmd} ${args.join(' ')}</span>...`);
                    await new Promise(res => setTimeout(res, 500 + Math.random() * 500));
                    writeToTerminal('Simulation complete.');
                    break;
                default:
                    if (command) writeToTerminal(`${command}: command not found`);
                    break;
            }
        } catch (e: any) {
            writeToTerminal(`<span class="text-red-400">Error: ${e.message}</span>`);
        } finally {
            setIsBusy(false);
        }
    }, [isBusy, currentPath, writeToTerminal, navigateTo, resolvePath, createOrUpdate]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (inputRef.current) {
                processCommand(inputRef.current.value);
                inputRef.current.value = '';
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (history.length > 0 && historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                if (inputRef.current) inputRef.current.value = history[newIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                if (inputRef.current) inputRef.current.value = history[newIndex];
            } else {
                setHistoryIndex(-1);
                if (inputRef.current) inputRef.current.value = '';
            }
        }
    };
    
    const handleBrowserGo = () => {
        if (browserRef.current && browserInputRef.current) {
            let url = browserInputRef.current.value;
            if (!/^(https?:\/\/)/i.test(url) && url.includes('.')) url = `https://${url}`;
            else if (!/^(https?:\/\/)/i.test(url)) url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            browserRef.current.src = url;
        }
    }

    const pathString = currentPath.join('/') || '/';

    return (
        <FsmViewWrapper
            title="IDE Matrix"
            description="A simulated polyglot IDE inspired by WebLabs-MobIDE, running entirely in the browser with a virtual file system, terminal, and AI agent capabilities."
        >
            <div className="max-w-7xl mx-auto h-[80vh] flex flex-col space-y-4">
                <div className="bg-stone-900 border border-stone-700 rounded-lg flex flex-col h-2/5">
                    <div className="flex items-center p-3 bg-stone-800 border-b border-stone-900 rounded-t-lg">
                        <input ref={browserInputRef} type="text" placeholder="Enter URL or search..." className="flex-grow bg-stone-900 text-stone-300 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={e => e.key === 'Enter' && handleBrowserGo()} />
                        <button onClick={handleBrowserGo} className="ml-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium">Go</button>
                    </div>
                    <div className="flex-grow overflow-hidden rounded-b-lg">
                        <iframe ref={browserRef} src="about:blank" className="w-full h-full bg-white"></iframe>
                    </div>
                </div>

                <div className="bg-stone-900 border border-stone-700 rounded-lg flex flex-col h-3/5">
                    <div ref={outputRef} className="flex-grow overflow-y-auto p-4 font-mono text-sm">
                        {output.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line }} />)}
                    </div>
                    <div className="flex items-center p-2 bg-stone-950 border-t border-stone-700 rounded-b-lg">
                        <span className="text-sm mr-2 font-mono">
                            <span className="text-teal-400">user@superlab</span>:<span className="text-violet-400">{pathString}</span><span className="text-stone-300">$</span>
                        </span>
                        <input ref={inputRef} type="text" className="flex-grow bg-transparent border-none font-mono text-stone-200 caret-green-400 outline-none text-sm" onKeyDown={handleKeyDown} autoFocus />
                    </div>
                </div>
            </div>
        </FsmViewWrapper>
    );
}
