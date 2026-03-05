---
description: Standard workflow for releasing a new version of Oneiro
---

这是每次发布新版本时需要执行的标准步骤。当你被要求执行发版流程时，请依次执行以下操作：

1. **确定并增加版本号 (Bump Version)**
   - 根据本次更新的影响（主版本/次版本/修订版本），决定新的版本号（如：从 2.0.1 到 2.1.0）。
   - 修改 `package.json` 中的 `"version"` 字段。

2. **撰写发行说明 (Write Release Notes)**
   - 在 `release/` 目录下创建一个与版本号相对应的文件夹（如 `release/v2.1.0/`）。
   - 在该文件夹内创建一个 `vX.X.X.md` 文件（如 `v2.1.0.md`）。
   - **极其重要要求：发行说明必须极其精简！不要写废话和营销式描述（比如"极致丝滑"、"量体裁衣"）。** 每一项只需要一句话概括核心变动，分为 `## 新增特性 (Features)`、`## 优化 (Polishes)`、`## 修复 (Bugfixes)` 等类目。

3. **更新 README.md (Update README)**
   - 更新 README.md 中的「更新日志」区块，将最新的改动简明扼要地追加到列表顶部，每个点一句话概括，不要太多小点，尽可能简单，不要废话。
   - 如果有新功能，在「功能特性」表格中添加说明，并在「路线图」中勾选完成。
   - 如果preview目录下有更新图片，根据功能更新将对应图片更新到readme.md中合适的位置

4. **构建发行包 (Build Zip Packages)**
   - 执行终端命令构建供商店/用户使用的压缩包：
   ```bash
   pnpm run zip:all
   ```
   *注意：这会在 `.output/` 目录下生成用于 Chrome/Edge 以及 Firefox 的 zip 压缩包。*

5. **移动安装包到 Release 文件夹 (Move Zips)**
   - 将生成的 `.zip` 包从 `.output/` 目录移动到对于版本的 release 目录中。
   ```bash
   cp .output/oneiro-*.zip release/vX.X.X/
   ```

6. **版本控制提交与打标签 (Git Commit & Tag)**
   - 提交所有本次更改及构建产物。执行以下终端命令：
   ```bash
   git add package.json README.md release/
   git commit -m "chore(release): bump version to vX.X.X"
   git tag "vX.X.X"
   ```
   *说明：将 `vX.X.X` 替换为实际的新版本号。*

7. **推送到远程仓库 (Git Push)**
   - 将提交和标签推送到远程仓库：
   ```bash
   git push origin main
   git push origin --tags
   ```

8. **通知用户完成情况 (Notify User)**
   - 整理执行结果，告知用户发版准备已全部完成（含版本号、产物目录等），等待用户在 GitHub Releases 创建并上传生成的 zip 包。