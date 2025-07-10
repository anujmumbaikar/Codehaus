import { CopyCheckIcon,CopyIcon, ReceiptRussianRuble } from "lucide-react";
import { useState,useMemo,useCallback,Fragment } from "react";
import Hint from "../Hint";
import { Button } from "../ui/button";
import CodeView from ".";
import { ResizablePanel,ResizableHandle,ResizablePanelGroup } from "../ui/resizable";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
    BreadcrumbPage
} from "../ui/breadcrumb"
import { convertFilesToTreeItems } from "@/lib/utils";
import TreeView from "../tree-view";
type FileCollection = {[path: string]: string};




function getLanguageFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || "text"
}
interface FileExplorerProps {
    files: FileCollection;
}

export const FileExplorer = ({files}:FileExplorerProps) => {
  const [copied, setCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(()=>{
        const fileKeys = Object.keys(files);
        return fileKeys.length > 0 ? fileKeys[0] : null;
    });
    const treeeData = useMemo(() => {
        return convertFilesToTreeItems(files);
    },[files]);

    const handleFileSelect = useCallback(
        (filePath: string) => {
            if (files[filePath]) {
                setSelectedFile(filePath);
            }
        },
        [files]
    );
    const handleCopy = () => {
        if(selectedFile){
            navigator.clipboard.writeText(files[selectedFile]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={20} className="bg-sidebar">
                <TreeView
                data={treeeData}
                value={selectedFile}
                onSelect={handleFileSelect}
                />
            </ResizablePanel>
            <ResizableHandle className="hover:bg-primary transition-colors"/>
            <ResizablePanel defaultSize={70} minSize={50}>
                {selectedFile && files[selectedFile] ? (
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                            <Hint text="Copy to clipboard" side="bottom">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-auto"
                                    onClick={handleCopy}
                                    disabled={copied}
                                >
                                    {copied ? <CopyCheckIcon /> : <CopyIcon />}
                                </Button>
                            </Hint>
                        </div>
                        <div className="overflow-auto flex-1">
                            <CodeView 
                            code={files[selectedFile]}
                            lang={getLanguageFromExtension(selectedFile)}
                            />
                        </div>
                    </div>
                ):(
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a file to view its content
                    </div>
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
