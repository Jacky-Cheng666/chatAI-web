<script setup name="layout">
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import Main from './components/Main.vue'
</script>
<template>
    <div class="app-wrapper flex">
        <Sidebar />
        <div class="main-container flex-column">
            <Navbar />
            <div id="main" class="main">
                <Main />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.app-wrapper {
    height: 100%;
    overflow-y: hidden;

    .main-container {
        flex: 1;
        background-color: #fff;

        .main {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;

            // 滚动条样式
            &::-webkit-scrollbar {
                width: 6px;
            }

            &::-webkit-scrollbar-thumb {
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.2);
            }

            &::-webkit-scrollbar-track {
                border-radius: 0;
                background: rgba(0, 0, 0, 0.1);
            }
        }
    }

}
</style>