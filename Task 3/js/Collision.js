class Collision {
    static aabb(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    static resolvePlatform(player, platform) {
        if (!Collision.aabb(player, platform)) return false;

        const overlapX = Math.min(player.x + player.width - platform.x, platform.x + platform.width - player.x);
        const overlapY = Math.min(player.y + player.height - platform.y, platform.y + platform.height - player.y);

        if (overlapY < overlapX) {
            if (player.y + player.height / 2 < platform.y + platform.height / 2) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            } else {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        } else {
            if (player.x + player.width / 2 < platform.x + platform.width / 2) {
                player.x = platform.x - player.width;
            } else {
                player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
        }

        return true;
    }
}
