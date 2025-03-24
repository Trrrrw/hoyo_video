<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
    <a-flex wrap="wrap" justify="center" align="center" gap="small">
        <p class="copyright">
            ©<a href="https://www.mihoyo.com/" target="_blank">miHoYo</a>版权所有
        </p>
        <p class="copyright">
            ©{{ currentYear }} By <a href="https://www.trrw.tech/" target="_blank">Trrrrw</a>
        </p>
    </a-flex>
</template>

<style scoped>
.copyright {
    color: #666;
    font-size: 14px;
}
</style>
